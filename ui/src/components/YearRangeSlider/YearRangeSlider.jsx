import React from "react";
import { Slider, Box, Typography } from "@mui/material";

const ABSOLUTE_MIN = 1900;
const ABSOLUTE_MAX = new Date().getFullYear();

function YearRangeSlider({ value, onChange, min, max, label, step }) {
  const sliderMin = min != null ? (label ? min : Math.max(min, ABSOLUTE_MIN)) : ABSOLUTE_MIN;
  const sliderMax = max != null ? (label ? max : Math.min(max, ABSOLUTE_MAX)) : ABSOLUTE_MAX;

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  const displayLabel = label || "Year Range";
  const formatValue = (v) => (step && step < 1 ? v.toFixed(0) : v);

  return (
    <Box sx={{ px: 2, pt: 1, pb: 0, overflow: "hidden" }}>
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
        {displayLabel}: {formatValue(value[0])} – {formatValue(value[1])}
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={sliderMin}
        max={sliderMax}
        step={step || 1}
        disableSwap
        sx={{
          "& .MuiSlider-thumb": {
            width: 18,
            height: 18,
          },
          "& .MuiSlider-valueLabel": {
            fontSize: "0.75rem",
          },
        }}
      />
    </Box>
  );
}

export default YearRangeSlider;
