"use client";

import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google"; 

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});


const customColors = {
  primary: "#003B88",
  focus: "#1976d2", 
  error: "#D32F2F",
  success: "#2E7D32",
};

const theme = createTheme({
  palette: {
    primary: { main: customColors.primary },
    secondary: { main: "#202937" },
    error: { main: customColors.error },
    success: { main: customColors.success },

  },
  components: {

    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill, select:-webkit-autofill': {
          WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
          boxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
          WebkitTextFillColor: `${theme.palette.text.primary} !important`,
          caretColor: `${theme.palette.text.primary} !important`,
          transition: "background-color 9999s ease-out, color 9999s ease-out",
          borderRadius: "inherit",
        },
      }),
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: customColors.focus,
            borderWidth: 1.5,
          },
          "&.Mui-focused": {
            boxShadow: "none",
            outline: "none",
          },
          "&:focus-within": {
            boxShadow: "none",
            outline: "none",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": { color: customColors.focus },
        },
      },
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily, 
  },
});

export default theme;