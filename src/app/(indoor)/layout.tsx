"use client";

import { useState } from "react";
import { Box, Toolbar, useTheme } from "@mui/material";
import Sidebar, { DRAWER_WIDTH, COLLAPSED_WIDTH } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function IndoorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      
      {/* Passamos a função handleToggle para o Header */}
      <Header onToggleSidebar={handleToggle} />

      {/* A Sidebar recebe o estado open, mas o controle (botão) fica no Header agora. 
          Ainda passamos o onToggle caso você queira fechar clicando fora em mobile no futuro.
      */}
      <Sidebar 
        open={sidebarOpen} 
        onToggle={handleToggle} 
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          p: 3,
          width: { 
             xs: "100%", 
             sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)` 
          },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar /> 
        {children}
      </Box>
    </Box>
  );
}