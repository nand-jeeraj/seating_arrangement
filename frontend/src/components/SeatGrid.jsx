import React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";

export default function SeatGrid({ seating }) {
  if (!seating || seating.length === 0) return null;

  return (
    <Box p={3} display="flex" flexDirection="column" alignItems="center">
      {seating.map((cls, classIdx) => (
        <Box key={classIdx} mb={5} width="100%" maxWidth={800}>
          <Typography variant="h6" gutterBottom>
            {`Class ${cls.class_no} Seating Arrangement`}
          </Typography>
          <Grid container direction="column" spacing={2} alignItems="center">
            {cls.seating.map((row, rowIdx) => (
              <Grid item key={rowIdx}>
                <Grid container spacing={2} justifyContent="center">
                  {row.map((seat, colIdx) => {
                    const seatLabel =
  seat && seat.name && seat.regno && seat.program_code
    ? `${seat.name}\n${seat.regno}\n${seat.program_code}`
    : "—";


                    return (
                      <Grid item key={colIdx}>
                        <Paper
                          elevation={3}
                          sx={{
                            width: "clamp(60px, 8vw, 100px)",
                            height: "clamp(60px, 8vw, 100px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            backgroundColor: seat ? "#e3f2fd" : "#f5f5f5",
                            fontWeight: "bold",
                            fontSize: { xs: "0.65rem", sm: "0.8rem" },
                            textAlign: "center",
                            overflow: "hidden",
                            whiteSpace: "pre-wrap", 
                          }}
                        >
                          {seatLabel}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
