import { useState } from "react";
import { ChartConfig } from "@/context/DashboardContext"; 
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Draggable } from "@hello-pangea/dnd";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Chip
} from "@mui/material";

// Dicionário para exibir o nome amigável do gráfico
const CHART_TYPE_LABELS: Record<string, string> = {
  'line': 'Série temporal',
  'geomap': 'Mapa geográfico',
  'pie': 'Pizza',
  'area': 'Área',
  'bar-horizontal': 'Barras',
  'bar': 'Colunas',
  'donut': 'Donut',
  'heatmap': 'Mapa de calor',
  'treemap': 'Árvore de dados',
};

export const ChartRow = ({ 
  item, 
  index, 
  onSave, 
  onDelete 
}: { 
  item: ChartConfig, 
  index: number, 
  onSave: (id: string, newTitle: string, newType: string) => void,
  onDelete: (id: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);

  const handleCancel = () => {
    setTempTitle(item.title);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (!tempTitle.trim()) return;

    // Mantém o tipo original do item na hora de salvar
    onSave(item.id, tempTitle, item.type);
    setIsEditing(false);
  };

  const chartName = CHART_TYPE_LABELS[item.type] || item.type;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          elevation={0}
          sx={{
            p: 2, 
            mb: 2, 
            bgcolor: "#F3F4F6", 
            border: "1px solid #E5E7EB", 
            minHeight: 80,
            display: "flex",       
            alignItems: "center"   
          }}
        >
          <Grid container alignItems="center" spacing={2} sx={{ width: "100%", m: 0 }}>
            
            {/* COLUNA 1: DADOS (md=6) */}
            <Grid size={{xs:12, md:6}} display="flex" alignItems="center" gap={2} sx={{ pl: "0 !important" }}>
              <Box 
                {...provided.dragHandleProps} 
                sx={{ cursor: "grab", display: "flex", color: "#9CA3AF", mr: 1 }}
              >
                <DragIndicatorIcon /> 
              </Box>
              
              {isEditing ? (
                <TextField 
                  fullWidth 
                  size="small" 
                  value={tempTitle} 
                  onChange={(e) => setTempTitle(e.target.value)}
                  sx={{ bgcolor: "white" }}
                  placeholder="Título obrigatório"
                  autoFocus
                />
              ) : (
                <Typography fontWeight="bold" color="#1F2937" sx={{ fontSize: "0.95rem" }}>
                  {item.title}
                </Typography>
              )}
            </Grid>

            {/* COLUNA 2: TIPO DE GRÁFICO (md=3) - AGORA APENAS LEITURA */}
            <Grid size={{xs:12, md:3}} display="flex" alignItems="center">
                <Chip 
                    label={chartName}
                    size="small"
                    sx={{ 
                        bgcolor: '#E6EDF5', 
                        color: "#003380", 
                        fontWeight: 500,
                        border: '1px solid "#003380"'
                    }}
                />
            </Grid>

            {/* COLUNA 3: AÇÕES (md=3) */}
            <Grid 
                size={{xs:12, md:3}} 
                display="flex" 
                justifyContent="flex-end" 
                alignItems="center"
            >
              
              {isEditing ? (
                <Box display="flex" gap={1}>
                    <Button 
                        variant="contained" 
                        onClick={handleConfirm}
                        disabled={!tempTitle.trim()}
                        size="small"
                        sx={{ bgcolor: "#003380", textTransform: "none", fontWeight: "bold" }}
                    >
                        Confirmar
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={handleCancel}
                        size="small"
                        sx={{ borderColor: "#003380", color: "#003380", textTransform: "none", fontWeight: "bold" }}
                    >
                        Cancelar
                    </Button>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" gap={1}> 
                    <Button
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setIsEditing(true)}
                        sx={{ 
                            color: "#1F2937", 
                            textTransform: "none", 
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            minWidth: "auto", 
                            "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
                        }}
                    >
                        Editar
                    </Button>
                  
                    <IconButton 
                        onClick={() => onDelete(item.id)} 
                        sx={{ color: "#DC2626" }} 
                        title="Excluir card"
                    >
                        <DeleteOutlineIcon />
                    </IconButton>
                </Box>
              )}

            </Grid>
          </Grid>
        </Paper>
      )}
    </Draggable>
  );
}