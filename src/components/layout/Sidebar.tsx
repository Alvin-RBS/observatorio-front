"use client";

import {
  Drawer,
  List,
  useTheme,
  Divider,
  CSSObject,
  Theme,
  Toolbar, // <--- Importante!
} from "@mui/material";

// Ícones
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import SidebarItem from "./SidebarItem";
import { useRouter } from "next/navigation";
import { HEADER_HEIGHT } from "./Header"; // Importar a altura se precisar, ou usar Toolbar

export const DRAWER_WIDTH = 260; // Voltei para 260 pois não tem mais texto longo
export const COLLAPSED_WIDTH = 70;

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const theme = useTheme();

  const menuItems = [
    { text: "Home", icon: HomeOutlinedIcon, path: "/home" },
    { text: "Histórico de envios", icon: AccessTimeOutlinedIcon, path: "/historico" },
    { text: "Meus envios", icon: CloudUploadOutlinedIcon, path: "/meus-envios" },
    { text: "Visualizar dados", icon: BarChartOutlinedIcon, path: "/visualizar-dados" },
    { text: "Relatórios", icon: DescriptionOutlinedIcon, path: "/relatorios" },
    { text: "Usuários", icon: PersonOutlinedIcon, path: "/usuarios" },
  ];

  const openedMixin = (theme: Theme): CSSObject => ({
    width: DRAWER_WIDTH,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  });

  const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: COLLAPSED_WIDTH,
  });

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...(open && {
          ...openedMixin(theme),
          "& .MuiDrawer-paper": openedMixin(theme),
        }),
        ...(!open && {
          ...closedMixin(theme),
          "& .MuiDrawer-paper": closedMixin(theme),
        }),
      }}
    >
      {/* O HEADER AZUL AGORA OCUPA O TOPO.
         Precisamos de um Toolbar vazio aqui dentro para empurrar 
         os itens para baixo na mesma altura do Header 
      */}
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'flex-end' : 'center',
          px: [1] 
        }}
      >
      </Toolbar>

      <Divider />

      <List sx={{ flexGrow: 1, mt: 1 }}>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.text}
            title={item.text}
            icon={item.icon}
            path={item.path}
            isOpen={open}
          />
        ))}
      </List>

      <Divider />

      <List>
         <SidebarItem
            title="Sair"
            icon={LogoutIcon}
            path="/login"
            isOpen={open}
          />
      </List>
    </Drawer>
  );
}