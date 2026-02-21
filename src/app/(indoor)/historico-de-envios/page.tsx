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
  Container,
  IconButton,
  Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"; // Ícone de download
import { useRouter } from "next/navigation";

// --- TIPAGEM DOS DADOS ---
type UploadStatus = "concluido" | "pendente" | "processando" | "erro";

interface UploadHistoryItem {
  id: number;
  fileName: string;
  indicator: string;
  user: string;
  status: UploadStatus;
  dateTime: string; // Data e hora formatadas
}

// --- DADOS MOCKADOS ---
const MOCK_HISTORY: UploadHistoryItem[] = [
  { 
    id: 1, 
    fileName: "dados_jovens_2025.xlsx", 
    indicator: "Jovens cumprindo medida", 
    user: "Ana Paula", 
    status: "concluido", 
    dateTime: "12/02/2026 às 14:30" 
  },
  { 
    id: 2, 
    fileName: "violencia_jan_2026.xlsx", 
    indicator: "Taxa de Homicídios", 
    user: "Carlos Eduardo", 
    status: "processando", 
    dateTime: "12/02/2026 às 14:15" 
  },
  { 
    id: 3, 
    fileName: "ocorrencias_bairros.csv", 
    indicator: "Ocorrências por Bairro", 
    user: "Mariana Costa", 
    status: "erro", 
    dateTime: "11/02/2026 às 09:45" 
  },
  { 
    id: 4, 
    fileName: "relatorio_anual.xlsx", 
    indicator: "Jovens cumprindo medida", 
    user: "Ana Paula", 
    status: "concluido", 
    dateTime: "10/02/2026 às 18:20" 
  },
  { 
    id: 5, 
    fileName: "base_geral_v2.xlsx", 
    indicator: "Base Geral", 
    user: "Ana Paula", 
    status: "pendente", 
    dateTime: "10/02/2026 às 10:00" 
  },
];

export default function HistoricoEnviosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // CORES ORIGINAIS DO SEU DESIGN
  const getStatusConfig = (status: UploadStatus) => {
    switch (status) {
      case "concluido":
        return { label: "Concluído", color: "#55E398", textColor: "#3F3F3F" }; // Verde original
      case "pendente":
        return { label: "Pendente", color: "#efec3e", textColor: "#3F3F3F" }; // Amarelo original
      case "processando":
        return { label: "Processando", color: "#F1B35C", textColor: "#3F3F3F" }; // Laranja original
      case "erro":
        return { label: "Erro", color: "#F15C5F", textColor: "#3F3F3F" }; // Vermelho original
      default:
        return { label: status, color: "#E0E0E0", textColor: "#000" };
    }
  };

  const filteredData = MOCK_HISTORY.filter((item) =>
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.indicator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ação de clique na linha (Redireciona para detalhes)
  const handleRowClick = (id: number) => {
    router.push(`/meus-envios/${id}`);
  };

  // Ação de download (Sem abrir a linha)
  const handleDownload = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation(); 
    alert(`Baixando arquivo: ${fileName}`); // Aqui entraria a lógica real de download
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      {/* TÍTULO (Sem botão "Novo Envio") */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
          Histórico de Envios
        </Typography>
      </Box>

      {/* CARD BRANCO ORIGINAL */}
      <Paper elevation={4} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        
        {/* BARRA DE BUSCA */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pesquisar por nome ou indicador"
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

        {/* TABELA COM COLUNAS EXTRAS */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label="tabela de histórico">
            <TableHead>
              <TableRow>
                {/* Estilo original do cabeçalho */}
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Nome do arquivo</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Indicador</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Quem enviou</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Data de envio</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "1rem", color: "#374151" }}>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => {
                  const statusConfig = getStatusConfig(row.status);
                  
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
                      sx={{ 
                        cursor: "pointer",
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#F9FAFB" } // Leve efeito hover para indicar clique
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ color: "#4B5563", fontWeight: 500 }}>
                        {row.fileName}
                      </TableCell>

                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.indicator}
                      </TableCell>

                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.user}
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                            label={statusConfig.label} 
                            size="small"
                            sx={{ 
                                bgcolor: statusConfig.color, 
                                color: statusConfig.textColor,
                                minWidth: 90,
                                fontSize: "0.85rem",
                                fontWeight: 500
                            }} 
                        />
                      </TableCell>
                      
                      <TableCell sx={{ color: "#6B7280" }}>
                        {row.dateTime}
                      </TableCell>

                      {/* Botão de Download na mesma linha */}
                      <TableCell align="center">
                        <Tooltip title="Baixar arquivo">
                            <IconButton onClick={(e) => handleDownload(e, row.fileName)}>
                                <FileDownloadOutlinedIcon sx={{ color: "#4B5563" }} />
                            </IconButton>
                        </Tooltip>
                      </TableCell>

                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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