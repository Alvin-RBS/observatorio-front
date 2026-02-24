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
  Container,
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { MOCK_USERS, getStatusConfig, UserItem } from "../[id]/mock"; 

export default function ListaUsuariosPage() {
  const router = useRouter(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [usersList, setUsersList] = useState<UserItem[]>([]);

  // Esse useEffect garante que a lista pegue os dados MOCK_USERS mais recentes da memória
  // toda vez que a página for montada, driblando o cache de navegação do Next.js
  useEffect(() => {
    setUsersList([...MOCK_USERS]);
  }, []);

  const filteredData = usersList.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (id: number) => {
    // Certifique-se de que a rota principal de visualização é /usuarios/[id]
    router.push(`/usuarios/${id}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
          Lista de Usuários
        </Typography>

        <Button 
            variant="contained" 
            onClick={() => router.push("/usuarios/novo")} // Rota para criação de usuário
            sx={{ 
                bgcolor: "primary.main",
                textTransform: "none", 
                fontWeight: "bold",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "primary.dark" }
            }}
        >
            Adicionar usuário
        </Button>
      </Box>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>

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
          <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Secretaria</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Status</TableCell>
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
                      hover
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        cursor: "pointer", 
                        transition: "background-color 0.2s"
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ color: "#4B5563", fontWeight: 500 }}>
                        {row.name}
                      </TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{row.type}</TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{row.secretaria}</TableCell>
                      <TableCell>
                        <Chip 
                            label={statusConfig.label} 
                            size="small"
                            sx={{ 
                                bgcolor: statusConfig.color, 
                                color: statusConfig.textColor,
                                minWidth: 90,
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
                    <Typography color="text.secondary">Nenhum usuário encontrado.</Typography>
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