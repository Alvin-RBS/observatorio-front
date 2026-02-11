"use client";

import { 
  AppBar, 
  Toolbar, 
  Box, 
  Typography, 
  Avatar, 
  Chip, 
  Stack,
  IconButton 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Ícone do Menu
import Image from "next/image";

export const HEADER_HEIGHT = 64;

// Definimos que o Header ACEITA uma função de toggle
interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const user = {
    name: "Álvaro Ribeiro ",
    role: "Admin",
    avatarUrl: "", 
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        bgcolor: "primary.main", 
        boxShadow: "none", 
        height: HEADER_HEIGHT,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: HEADER_HEIGHT }}>
        
        {/* LADO ESQUERDO: MENU + LOGO */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
           
           {/* BOTÃO DE MENU AGORA FICA AQUI */}
           <IconButton 
             onClick={onToggleSidebar}
             edge="start"
             color="inherit"
             aria-label="menu"
           
           >
             <MenuIcon />
           </IconButton>

           <Image 
             src="/logos/Logo-pernambuco.png" 
             alt="Logo PE" 
             width={120} 
             height={40} 
             style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} 
           />
        </Box>

        {/* LADO DIREITO: PERFIL (Mantém igual) */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar 
              alt={user.name} 
              src={user.avatarUrl} 
              sx={{ width: 36, height: 36, bgcolor: "secondary.main" }}
            />
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography variant="body2" color="white" fontWeight="bold">
                {user.name}
              </Typography>
            </Box>
            <Chip 
              label={user.role} 
              size="small" 
              sx={{ 
                bgcolor: "white", 
                color: "primary.main", 
                fontWeight: "bold",
                height: 20,
                fontSize: "0.7rem"
              }} 
            />
          </Stack>
        </Stack>

      </Toolbar>
    </AppBar>
  );
}