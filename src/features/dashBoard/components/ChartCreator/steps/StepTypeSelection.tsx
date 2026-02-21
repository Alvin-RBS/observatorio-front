import { Box, Typography, Grid, Paper, alpha, useTheme } from "@mui/material";
import { ChartType } from "@/context/DashboardContext";

// --- ÍCONES ---
import ShowChartIcon from '@mui/icons-material/ShowChart';       // Line
import BarChartIcon from '@mui/icons-material/BarChart';         // Bar
import PieChartIcon from '@mui/icons-material/PieChart';         // Pie
import MapIcon from '@mui/icons-material/Map';                   // Map
import DonutLargeIcon from '@mui/icons-material/DonutLarge';     // Donut
import LandscapeIcon from '@mui/icons-material/Landscape';       // Area
// Novos ícones distintos:
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';       // Treemap (Visual de retângulos aninhados)
import GridOnIcon from '@mui/icons-material/GridOn';             // Heatmap (Visual de matriz/grid)

interface Props {
  selectedType: ChartType | null;
  onSelect: (type: ChartType) => void;
}

const CHART_OPTIONS: { type: ChartType; label: string; icon: any }[] = [
  { type: 'line', label: 'Linha', icon: ShowChartIcon },
  { type: 'area', label: 'Área', icon: LandscapeIcon },
  { type: 'bar', label: 'Colunas', icon: BarChartIcon },
  { type: 'bar-horizontal', label: 'Barras', icon: BarChartIcon }, 
  { type: 'pie', label: 'Pizza', icon: PieChartIcon },
  { type: 'donut', label: 'Donut', icon: DonutLargeIcon },
  { type: 'geomap', label: 'Mapa', icon: MapIcon },
  { type: 'treemap', label: 'Árvore de Dados', icon: ViewQuiltIcon }, // Ícone atualizado
  { type: 'heatmap', label: 'Mapa de Calor', icon: GridOnIcon }, // Ícone atualizado
];

export const StepTypeSelection = ({ selectedType, onSelect }: Props) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        Selecione o tipo de gráfico:
      </Typography>
      
      {/* Reduzi o spacing de 2 para 1.5 para economizar espaço horizontal e vertical */}
      <Grid container spacing={0.5}>
        {CHART_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.type;
          const Icon = opt.icon;

          return (
            // Ajustei os breakpoints para caberem melhor em telas pequenas sem quebrar layout
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={opt.type}>
              <Paper
                elevation={0}
                onClick={() => onSelect(opt.type)}
                sx={{
                  // Reduzi o padding de 2 para 1.5 para deixar o card mais baixo
                  p: 1.5,
                  border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  // Reduzi o gap interno
                  gap: 1,
                  height: '100%', // Garante altura uniforme
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                <Icon 
                    sx={{ 
                        // Ícone levemente menor para economizar altura
                        fontSize: 28, 
                        color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                        transform: opt.type === 'bar-horizontal' ? 'rotate(90deg)' : 'none'
                    }} 
                />
                <Typography 
                    variant="caption" 
                    fontWeight={isSelected ? "bold" : "normal"}
                    align="center"
                    color={isSelected ? "primary" : "text.primary"}
                    sx={{ lineHeight: 1.2 }}
                >
                  {opt.label}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};