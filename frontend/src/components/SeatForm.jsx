import { useState, forwardRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  Paper,
  Snackbar,
  Slide,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Add, Delete } from "@mui/icons-material";
import { API } from "../api";
import global1 from "../global1";


const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function SeatForm({ setSeating }) {
  const [programs, setPrograms] = useState([{ code: "", year: "", count: "" }]);
  const [classes, setClasses] = useState([
    { class_no: "", rows: "", cols: "", allotted: "" },
  ]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleProgramChange = (i, field, value) => {
    const newPrograms = [...programs];
    newPrograms[i][field] = value;
    setPrograms(newPrograms);
  };

  const handleAddProgram = () => {
    setPrograms([...programs, { code: "", year: "", count: "" }]);
  };

  const handleRemoveProgram = (i) => {
    setPrograms(programs.filter((_, idx) => idx !== i));
  };

  const handleClassChange = (i, field, value) => {
    const newClasses = [...classes];
    newClasses[i][field] = value;
    setClasses(newClasses);
  };

  const handleAddClass = () => {
    setClasses([...classes, { class_no: "", rows: "", cols: "", allotted: "" }]);
  };

  const handleRemoveClass = (i) => {
    setClasses(classes.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      colid: global1.colid,
      programs: programs
        .filter((p) => p.code && p.year && p.count)
        .map((p) => ({
          program_code: p.code.trim().toUpperCase(),
          year: parseInt(p.year, 10),
          num_students: parseInt(p.count, 10),
        })),
      classes: classes
        .filter((c) => c.class_no && c.rows && c.cols)
        .map((c) => ({
          class_no: parseInt(c.class_no, 10),
          rows: parseInt(c.rows, 10),
          cols: parseInt(c.cols, 10),
          allotted: c.allotted ? parseInt(c.allotted, 10) : null,
          seats: parseInt(c.rows, 10) * parseInt(c.cols, 10),
        })),
    };

    try {
      const res = await API.post("/api/generate-seating", payload);
      if (res.data.classes) {
        setSeating(res.data.classes);
        setSnackbar({
          open: true,
          message: "Seating successfully generated!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Error generating seating",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to generate seating",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2, sm: 4 },
        maxWidth: 700,
        mx: "auto",
        mt: 5,
        borderRadius: 3,
      }}
    >
      {/* Heading */}
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        Exam Hall Seating Arrangement
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Programs */}
        <Typography variant="h6">Programs</Typography>
        {programs.map((p, i) => (
          <Grid container spacing={2} key={i} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Program Code"
                value={p.code}
                onChange={(e) => handleProgramChange(i, "code", e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Year"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                value={p.year}
                onChange={(e) => handleProgramChange(i, "year", e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Students Count"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                value={p.count}
                onChange={(e) =>
                  handleProgramChange(i, "count", e.target.value)
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton
                color="error"
                onClick={() => handleRemoveProgram(i)}
                disabled={programs.length === 1}
              >
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddProgram}
        >
          Add Program
        </Button>

        {/* Classes */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Classes
        </Typography>
        {classes.map((c, i) => (
          <Grid container spacing={2} key={i} alignItems="center">
            <Grid item xs={12} sm={2}>
              <TextField
                label="Class Number"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                value={c.class_no}
                onChange={(e) =>
                  handleClassChange(i, "class_no", e.target.value)
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Rows"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                value={c.rows}
                onChange={(e) => handleClassChange(i, "rows", e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Columns"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                value={c.cols}
                onChange={(e) => handleClassChange(i, "cols", e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Allotted Students"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                value={c.allotted}
                onChange={(e) =>
                  handleClassChange(i, "allotted", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Seats: {c.rows && c.cols ? c.rows * c.cols : 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton
                color="error"
                onClick={() => handleRemoveClass(i)}
                disabled={classes.length === 1}
              >
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button variant="outlined" startIcon={<Add />} onClick={handleAddClass}>
          Add Class
        </Button>

        {/* Submit */}
        <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
          Generate Seating
        </Button>
      </Box>

      {/* Snackbar with Slide Transition */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
