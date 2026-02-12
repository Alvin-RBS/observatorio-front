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
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";

type UserStatus = "Ativa" | "Desativado" | "Pendente";
interface UserItem {
  id: number;
  email: string;
  type: string;
  secretaria: string;
  status: UserStatus;
  createdAt: string;
  inactivatedAt: string; 
}

// --- DADOS MOCKADOS ---
const MOCK_USERS: UserItem[] = [
  { id: 1, email: "anapaulac123@gmail.com", type: "Operador", secretaria: "SJDH", status: "Ativa", createdAt: "02/02/2026", inactivatedAt: "-" },
  { id: 2, email: "anapaulac123@gmail.com", type: "Operador", secretaria: "SJDH", status: "Desativado", createdAt: "02/02/2026", inactivatedAt: "-" },
  { id: 3, email: "anapaulac123@gmail.com", type: "Operador", secretaria: "SJDH", status: "Pendente", createdAt: "02/02/2026", inactivatedAt: "-" },
  { id: 4, email: "anapaulac123@gmail.com", type: "Operador", secretaria: "SJDH", status: "Ativa", createdAt: "02/02/2026", inactivatedAt: "-" },
  { id: 5, email: "anapaulac123@gmail.com", type: "Operador", secretaria: "SJDH", status: "Ativa", createdAt: "02/02/2026", inactivatedAt: "-" },
  { id: 6, email: "anapaulac123@gmail.com", type: "Operador", secretaria: "SJDH", status: "Ativa", createdAt: "02/02/2026", inactivatedAt: "-" },
];

export default function ListaUsuariosPage() {
  const router = useRouter(); 
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusConfig = (status: UserStatus) => {
    switch (status) {
      case "Ativa":
        return { label: "Ativa", color: "#55E398", textColor: "#3F3F3F" }; 
      case "Desativado":
        return { label: "Desativado", color: "#F1B35C", textColor: "#3F3F3F" }; 
      case "Pendente":
        return { label: "Pendente", color: "#efec3e", textColor: "#3F3F3F" }; 
      default:
        return { label: status, color: "#E0E0E0", textColor: "#000" };
    }
  };

  const filteredData = MOCK_USERS.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (id: number) => {
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
            onClick={() => router.push("/usuarios/novo")}
            sx={{ 
                bgcolor: "primary", 
                textTransform: "none", 
                fontWeight: "bold",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#002255" }
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
                    borderRadius: 1,
                    backgroundColor: "#fff"
                }
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label="tabela de usuários">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>E-mail</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Secretaria</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Status da conta do usuário</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Data da criação da conta</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#374151" }}>Data de inativação</TableCell>
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
                        "&:last-child td, &:last-child th": { border: 0 },
                        cursor: "pointer", 
                        transition: "background-color 0.2s"
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ color: "#4B5563" }}>
                        {row.email}
                      </TableCell>

                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.type}
                      </TableCell>

                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.secretaria}
                      </TableCell>
                      
                      <TableCell>
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
                      
                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.createdAt}
                      </TableCell>
                      
                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.inactivatedAt}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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