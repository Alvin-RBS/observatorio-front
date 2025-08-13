"use client";

import "./globals.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "@fontsource/roboto";
import theme from "@/components/themes/theme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/logoSite.svg" sizes="any" />
      </head>
      <body className="antialiased">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
