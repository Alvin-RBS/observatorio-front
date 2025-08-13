import { Alert, Collapse } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import { useEffect, useState } from "react";

interface Props {
  type: "success" | "error";
  message: string;
  duration?: number;
  width?: string; 
}

export default function AlertMessage({ type, message, duration = 4000, width = "320px" }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOpen(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <Collapse in={open}>
      <Alert
        icon={
          type === "success" ? (
            <CheckCircleOutlinedIcon fontSize="inherit" />
          ) : (
            <ErrorOutlineOutlinedIcon fontSize="inherit" />
          )
        }
        severity={type}
        sx={{
          width: { width },
          borderRadius: 1,
          alignItems: "center",
          color:
            type === "error"
              ? "#B71C1C" 
              : "var(--_components-alert-success-color, #2E7D32)",
          fontFeatureSettings: "'liga' off, 'clig' off",
          fontFamily: "var(--fontFamily, Roboto)",
          fontSize: "var(--_fontSize-1rem, 16px)",
          fontStyle: "normal",
          fontWeight: "var(--fontWeightBold, 600)",
          lineHeight: "150%",
          letterSpacing: "0.15px",
        }}
      >
        {message}
      </Alert>
    </Collapse>
  );
}
