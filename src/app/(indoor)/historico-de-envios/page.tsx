"use client";

import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { MOCK_ENVIOS, getEnvioStatusConfig, EnvioItem } from "./mockEnvios"; 

export default function ListaEnviosPage() {
  const router = useRouter(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [enviosList, setEnviosList] = useState<EnvioItem[]>([]);

  useEffect(() => {
    setEnviosList([...MOCK_ENVIOS]);
  }, []);

  const filteredData = enviosList.filter((envio) =>
    envio.arquivoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    envio.usuarioNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (id: number) => {
    router.push(`/historico-de-envios/${id}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            Histórico de Envios
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.5}>
            Acompanhe a auditoria de arquivos processados no sistema.
            </Typography>
        </Box>
      </Box>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pesquisar por nome do arquivo ou usuário..." 
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
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    transition: "all 0.3s ease", 
                    "&.Mui-focused": {
                        boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.08)", 
                        transform: "translateY(-1px)",
                    }
                }
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de envios">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Data / Hora</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Usuário</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Arquivo</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => {
                  const statusConfig = getEnvioStatusConfig(row.status);
                  
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
                      hover
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        cursor: "pointer", 
                        transition: "background-color 0.2s"
                      }}
                    >
                      <TableCell sx={{ color: "#4B5563" }}>{row.dataHora}</TableCell>
                      <TableCell sx={{ color: "#4B5563", fontWeight: 500 }}>{row.usuarioNome}</TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{row.arquivoNome}</TableCell>
                      <TableCell>
                        <Chip 
                            label={statusConfig.label} 
                            size="small"
                            sx={{ 
                                bgcolor: statusConfig.color, 
                                color: statusConfig.textColor,
                                minWidth: 100,
                                fontSize: "0.85rem",
                                fontWeight: "bold"
                            }} 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">Nenhum registro de envio encontrado.</Typography>
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