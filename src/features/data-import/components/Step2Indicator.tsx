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
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

// --- MUDANÇA: Importamos a configuração centralizada que criamos no Passo 1 ---
import { INDICATORS_DB } from "@/data/indicatorsConfig"; 

interface Step2IndicatorProps {
  selectedIndicator: string;
  setIndicator: (id: string) => void;
}

export default function Step2Indicator({ selectedIndicator, setIndicator }: Step2IndicatorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtra a lista baseado na busca
  const filteredIndicators = INDICATORS_DB.filter(ind => 
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
                        // Estilo quando selecionado
                        "&.Mui-selected": {
                            backgroundColor: "#E3F2FD", // Azul claro (primary.lighter)
                            borderLeft: "4px solid",
                            borderColor: "primary.main",
                            "&:hover": {
                                backgroundColor: "#BBDEFB", // Azul um pouco mais escuro no hover do selecionado
                            }
                        },
                         // Estilo hover padrão (quando não selecionado)
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
                  
                  {/* Exibe o Label + Tipo do indicador */}
                  <ListItemText 
                    id={item.label}
                    primary={item.label} 
                    // Mostra se é Taxa ou Absoluto para ajudar o usuário
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
      </Paper>
    </Box>
  );
}