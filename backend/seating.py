from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import random
import re
import os
from dotenv import load_dotenv

load_dotenv()

seating_bp = Blueprint("seating", __name__)

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
students_collection = db["users"]


def normalize_program(code: str) -> str:
    return (code or "").strip().lower()


def is_valid_position(seat_grid, r, c, student) -> bool:
    """Check if placing a student at (r, c) does not put same program in LEFT, RIGHT, UP, DOWN."""
    rows = len(seat_grid)
    cols = len(seat_grid[0]) if seat_grid else 0
    this_prog = normalize_program(student["program_code"])

    # Check LEFT
    if c - 1 >= 0 and seat_grid[r][c - 1]:
        if normalize_program(seat_grid[r][c - 1]["program_code"]) == this_prog:
            return False

    # Check RIGHT
    if c + 1 < cols and seat_grid[r][c + 1]:
        if normalize_program(seat_grid[r][c + 1]["program_code"]) == this_prog:
            return False

    # Check UP
    if r - 1 >= 0 and seat_grid[r - 1][c]:
        if normalize_program(seat_grid[r - 1][c]["program_code"]) == this_prog:
            return False

    # Check DOWN
    if r + 1 < rows and seat_grid[r + 1][c]:
        if normalize_program(seat_grid[r + 1][c]["program_code"]) == this_prog:
            return False

    return True


def fill_seating(class_students, rows, cols):
    """Fill seating grid ensuring no same program neighbors in 4 directions."""
    seat_grid = [[None for _ in range(cols)] for _ in range(rows)]
    positions_all = [(r, c) for r in range(rows) for c in range(cols)]
    random.shuffle(positions_all)

    unplaced = []
    for student in class_students:
        placed = False
        random.shuffle(positions_all)
        for (r, c) in positions_all:
            if seat_grid[r][c] is None and is_valid_position(seat_grid, r, c, student):
                seat_grid[r][c] = student
                placed = True
                break
        if not placed:
            unplaced.append(student)

    # Force place leftovers (may break rule if impossible)
    for student in unplaced:
        for (r, c) in positions_all:
            if seat_grid[r][c] is None:
                seat_grid[r][c] = student
                break

    return seat_grid


@seating_bp.route("/api/generate-seating", methods=["POST"])
def seating_route():
    try:
        data = request.json or {}
        programs = data.get("programs", [])
        classes = data.get("classes", [])
        colid = data.get("colid")

        if not programs or not classes or not colid:
            return jsonify({"error": "Missing required fields"}), 400

        all_students = []
        for p in programs:
            prog_code_input = (p.get("program_code") or "").strip()
            year = p.get("year")

            if not prog_code_input or year is None:
                return jsonify({"error": "Each program must include program_code and year"}), 400

            prog_regex = {"$regex": f"^{re.escape(prog_code_input)}$", "$options": "i"}
            num_students = p.get("num_students")

            base_query = {
                "colid": colid,
                "admissionyear": str(year),
                "programcode": prog_regex,
            }

            cursor = students_collection.find(base_query)
            if isinstance(num_students, int) and num_students > 0:
                cursor = cursor.limit(num_students)

            students = list(cursor)

            for s in students:
                all_students.append({
                    "name": s.get("name", "Unnamed"),
                    "regno": s.get("regno", ""),
                    "program_code": s.get("programcode", prog_code_input),
                })

        random.shuffle(all_students)

        result_classes = []
        student_idx = 0

        for c in classes:
            rows = int(c["rows"])
            cols = int(c["cols"])
            class_no = c["class_no"]
            allotted = c.get("allotted")

            capacity = rows * cols
            if allotted and allotted > 0:
                capacity = min(capacity, allotted)

            class_students = all_students[student_idx: student_idx + capacity]
            student_idx += capacity

            seat_grid = fill_seating(class_students, rows, cols)

            result_classes.append({
                "class_no": class_no,
                "seating": seat_grid
            })

        return jsonify({"classes": result_classes})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
