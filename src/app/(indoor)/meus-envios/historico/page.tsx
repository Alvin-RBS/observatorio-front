"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Container
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// --- TIPAGEM DOS DADOS ---
type UploadStatus = "concluido" | "pendente" | "processando" | "erro";

interface UploadHistoryItem {
  id: number;
  fileName: string;
  status: UploadStatus;
  date: string;
}

// --- DADOS MOCKADOS (Para visualizar igual à imagem) ---
const MOCK_DATA: UploadHistoryItem[] = [
  { id: 1, fileName: "Jovens cumprindo medida socioeducativa", status: "concluido", date: "00:20" },
  { id: 2, fileName: "Jovens cumprindo medida socioeducativa", status: "concluido", date: "00:20" },
  { id: 3, fileName: "Jovens cumprindo medida socioeducativa", status: "pendente", date: "00:20" },
  { id: 4, fileName: "Jovens cumprindo medida socioeducativa", status: "concluido", date: "00:20" },
  { id: 5, fileName: "Jovens cumprindo medida socioeducativa", status: "processando", date: "00:20" },
  { id: 6, fileName: "Jovens cumprindo medida socioeducativa", status: "erro", date: "00:20" },
  { id: 7, fileName: "Jovens cumprindo medida socioeducativa", status: "concluido", date: "00:20" },
];

export default function HistoricoEnviosPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Função para definir a cor do Chip baseado no status
  const getStatusConfig = (status: UploadStatus) => {
    switch (status) {
      case "concluido":
        return { label: "Concluído", color: "#55E398", textColor: "#3F3F3F" }; // Verde
      case "pendente":
        return { label: "Pendente", color: "#efec3e", textColor: "#3F3F3F" }; // Amarelo
      case "processando":
        return { label: "Processando", color: "#F1B35C", textColor: "#3F3F3F" }; // Laranja
      case "erro":
        return { label: "Erro", color: "#F15C5F", textColor: "#3F3F3F" }; // Vermelho
      default:
        return { label: status, color: "#E0E0E0", textColor: "#000" };
    }
  };

  // Filtragem simples pelo nome
  const filteredData = MOCK_DATA.filter((item) =>
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Título da Página */}
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: "#333" }}>
        Meus envios
      </Typography>

      {/* Card Branco Principal */}
      <Paper elevation={4} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        
        {/* Barra de Busca */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pesquisar por nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
                maxWidth: "100%",
                "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#fff"
                }
            }}
          />
        </Box>

        {/* Tabela */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de histórico">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Nome do arquivo</TableCell>
                <TableCell align="left" sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Status do envio</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Data de envio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => {
                  const statusConfig = getStatusConfig(row.status);
                  
                  return (
                    <TableRow
                      key={row.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" sx={{ color: "#4B5563" }}>
                        {row.fileName}
                      </TableCell>
                      
                      <TableCell align="left">
                        <Chip 
                            label={statusConfig.label} 
                            size="small"
                            sx={{ 
                                bgcolor: statusConfig.color, 
                                color: statusConfig.textColor,
                                minWidth: 90,
                                fontSize: "0.85rem"
                            }} 
                        />
                      </TableCell>
                      
                      <TableCell align="center" sx={{ color: "#6B7280" }}>
                        {row.date}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">Nenhum envio encontrado.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Paper>
    </Container>
  );
}