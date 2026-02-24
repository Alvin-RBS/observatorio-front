"use client";

import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Radio, 
  Paper,
  TextField,
  InputAdornment,
  CircularProgress // Adicionado para feedback visual
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from "react";
// Importamos o serviço real no lugar do arquivo de mock
import { getAllIndicators, IndicatorConfig } from "@/features/data-import/services/indicatorService";

interface Step2IndicatorProps {
  selectedIndicator: string;
  setIndicator: (id: string) => void;
}

export default function Step2Indicator({ selectedIndicator, setIndicator }: Step2IndicatorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [indicatorsList, setIndicatorsList] = useState<IndicatorConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca os indicadores da AWS quando o componente montar
  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const data = await getAllIndicators();
        setIndicatorsList(data);
      } catch (error) {
        console.error("Erro ao carregar os indicadores da API:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIndicators();
  }, []);

  // Filtra a lista vinda da API baseada na busca
  const filteredIndicators = indicatorsList.filter(ind => 
    ind.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Selecionar indicador
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Escolha o indicador que você deseja atualizar. O sistema solicitará as colunas de 
          <strong> cálculo</strong> e <strong>contexto</strong> baseadas na sua escolha.
        </Typography>
      </Box>

      {/* Campo de Busca */}
      <TextField
        fullWidth
        placeholder="Selecione indicador ou digite para buscar..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2, bgcolor: "#F8FAFC" }}
        disabled={isLoading} // Desabilita enquanto carrega
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Lista de Seleção */}
      <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto" }}>
        {isLoading ? (
          <Box p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
             <CircularProgress size={32} />
             <Typography color="text.secondary">Carregando indicadores do sistema...</Typography>
          </Box>
        ) : (
          <List>
            {filteredIndicators.map((item) => {
              const isSelected = selectedIndicator === item.id;
              
              return (
                <ListItem key={item.id} disablePadding divider>
                  <ListItemButton 
                      onClick={() => setIndicator(item.id)} 
                      dense
                      selected={isSelected} 
                      sx={{
                          "&.Mui-selected": {
                              backgroundColor: "#E3F2FD", 
                              borderLeft: "4px solid",
                              borderColor: "primary.main",
                              "&:hover": {
                                  backgroundColor: "#BBDEFB", 
                              }
                          },
                          "&:hover": {
                              backgroundColor: "#F1F5F9", 
                          },
                      }}
                  >
                    <ListItemIcon>
                      <Radio
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': item.label }}
                      />
                    </ListItemIcon>
                    
                    <ListItemText 
                      id={item.label}
                      primary={item.label} 
                      secondary={item.type === 'RATE' ? `Taxa (por ${item.multiplier?.toLocaleString()})` : "Números Absolutos"}
                      primaryTypographyProps={{ 
                          fontWeight: isSelected ? "bold" : "regular",
                          color: isSelected ? "primary.main" : "text.primary"
                      }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            
            {filteredIndicators.length === 0 && (
              <Box p={3} textAlign="center">
                <Typography color="text.secondary">Nenhum indicador encontrado.</Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
}