import {
  CircularProgress,
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import { alpha, darken } from "@mui/material/styles";
import React from "react";

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  maxWidth?: string | number;
}

const PRIMARY = "#0049A9";

export default function Button({
  loading,
  children,
  maxWidth = "100%",
  sx,
  ...props
}: ButtonProps) {
  const variant = props.variant ?? "contained";
  const color = props.color ?? "primary";

  return (
    <MuiButton
      {...props}
      disabled={props.disabled || loading}
      variant={variant}
      color={color}
      sx={[
        {
          position: "relative",
          borderRadius: "4px",
          maxWidth,
          width: "100%",
          padding: "8px 22px",
          minHeight: 44, 
          boxShadow:
            "0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)",
          fontFamily: "Roboto",
          fontSize: "15px",
          fontWeight: 500,
          letterSpacing: "0.46px",
          textTransform: "uppercase",

          ...(variant === "contained" &&
            color === "primary" && {
              backgroundColor: PRIMARY,
              color: "#fff",
              "&:hover": {
                backgroundColor: darken(PRIMARY, 0.08), 
              },
            }),

          ...(variant === "outlined" &&
            color === "primary" && {
              borderColor: PRIMARY,
              color: PRIMARY,
              "&:hover": {
                borderColor: darken(PRIMARY, 0.12),
                backgroundColor: alpha(PRIMARY, 0.08),
              },
            }),

          ...(variant === "text" &&
            color === "primary" && {
              color: PRIMARY,
              "&:hover": {
                backgroundColor: alpha(PRIMARY, 0.08),
              },
            }),
        },
        sx as any,
      ]}
    >
      {loading && (
        <CircularProgress
          size={20}
          color="inherit"
          sx={{ position: "absolute" }}
        />
      )}

      <span style={{ visibility: loading ? "hidden" : "visible", width: "100%" }}>
        {children}
      </span>
    </MuiButton>
  );
}
