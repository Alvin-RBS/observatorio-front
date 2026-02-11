import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { FC } from "react";

interface SidebarItemProps {
  path: string;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
}

const SidebarItem: FC<SidebarItemProps> = ({ path, title, icon: Icon, isOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  // Verifica se a rota atual começa com o path deste item (para deixar azul)
  const active = pathname.startsWith(path);

  const handleClick = () => {
    router.push(path);
  };

  return (
    // Se estiver fechado (!isOpen), mostra o Tooltip. Se aberto, tooltip vazio.
    <Tooltip title={!isOpen ? title : ""} placement="right" arrow>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          selected={active}
          onClick={handleClick}
          sx={{
            minHeight: 48,
            justifyContent: isOpen ? "initial" : "center",
            px: 2.5,
            transition: theme.transitions.create(["background-color", "color"], {
                duration: theme.transitions.duration.shortest,
            }),
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.main + "14", // 14 é hex para opacidade baixa
              color: "primary.main",
              "& .MuiListItemIcon-root": {
                color: "primary.main",
              },
            },
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isOpen ? 2 : "auto", // Margem dinâmica
              justifyContent: "center",
              color: active ? "primary.main" : "text.secondary",
            }}
          >
            <Icon />
          </ListItemIcon>
          
          {/* O texto só aparece se estiver aberto */}
          <ListItemText 
            primary={title} 
            sx={{ 
                opacity: isOpen ? 1 : 0,
                display: isOpen ? "block" : "none", // Esconde totalmente para não quebrar layout
                transition: "opacity 0.2s"
            }} 
          />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

export default SidebarItem;