"use client";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";

type CheckboxProps = {
  id: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color?: string;
  label?: string;
  labelColor?: string;
  size?: "small" | "medium" | "large";
  labelSize?: number;
};

export default function CheckBoxSara({
  id,
  checked,
  onChange,
  color,
  label = "",
  labelColor,
  size = "medium",
  labelSize = 14,
}: CheckboxProps) {
  const theme = useTheme();
  const finalColor = color || theme.palette.primary.main;
  const finalLabelColor = labelColor || "inherit";

  return (
    <FormControlLabel
      control={
        <Checkbox
          id={id}
          checked={checked}
          onChange={onChange}
          sx={{
            color: finalColor,
            "&.Mui-checked": {
              color: finalColor,
            },
          }}
          size={size}
        />
      }
      label={label}
      sx={{
        color: finalLabelColor,
      }}
      slotProps={{
        typography: {
          sx: {
            fontSize: labelSize,
          },
        },
      }}
    />

  );
}
