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
  name: string;      // Adicionado campo Nome
  email: string;     // Mantido no dado, mas não exibido na coluna
  type: string;
  secretaria: string;
  status: UserStatus;
  createdAt: string;
  inactivatedAt: string;
}

// --- DADOS MOCKADOS DIVERSIFICADOS ---
const MOCK_USERS: UserItem[] = [
  { 
    id: 1, 
    name: "Alberto Santos Alves", 
    email: "alberto.santos@sjdh.com",
    type: "Operador", 
    secretaria: "SJDH", 
    status: "Ativa", 
    createdAt: "02/02/2026", 
    inactivatedAt: "-" 
  },
  { 
    id: 2, 
    name: "Carlos Eduardo Silva", 
    email: "carlos.silva@exemplo.com", 
    type: "Gestor", 
    secretaria: "SDS", 
    status: "Desativado", 
    createdAt: "15/01/2025", 
    inactivatedAt: "10/02/2026" 
  },
  { 
    id: 3, 
    name: "Mariana Souza", 
    email: "mariana.souza@exemplo.com", 
    type: "Operador", 
    secretaria: "Saúde", 
    status: "Pendente", 
    createdAt: "12/02/2026", 
    inactivatedAt: "-" 
  },
  { 
    id: 4, 
    name: "Roberto Almeida", 
    email: "roberto.almeida@exemplo.com", 
    type: "Admin", 
    secretaria: "Educação", 
    status: "Ativa", 
    createdAt: "20/11/2025", 
    inactivatedAt: "-" 
  },
  { 
    id: 5, 
    name: "Fernanda Lima", 
    email: "fernanda.lima@exemplo.com", 
    type: "Operador", 
    secretaria: "SJDH", 
    status: "Ativa", 
    createdAt: "05/01/2026", 
    inactivatedAt: "-" 
  },
  { 
    id: 6, 
    name: "João Pedro Santos", 
    email: "joao.pedro@exemplo.com", 
    type: "Gestor", 
    secretaria: "SDS", 
    status: "Pendente", 
    createdAt: "13/02/2026", 
    inactivatedAt: "-" 
  },
];

export default function ListaUsuariosPage() {
  const router = useRouter(); 
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusConfig = (status: UserStatus) => {
    switch (status) {
      case "Ativa":
        return { label: "Ativo", color: "#55E398", textColor: "#3F3F3F" }; 
      case "Desativado":
        return { label: "Desativado", color: "#F1B35C", textColor: "#3F3F3F" }; 
      case "Pendente":
        return { label: "Pendente", color: "#efec3e", textColor: "#3F3F3F" }; 
      default:
        return { label: status, color: "#E0E0E0", textColor: "#000" };
    }
  };

  // Filtragem agora busca pelo NOME
  const filteredData = MOCK_USERS.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                bgcolor: "primary.main", // Usando token do tema se disponível, ou cor fixa
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
                    borderRadius: 1,
                    backgroundColor: "#fff"
                }
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
            <TableHead>
              <TableRow>
                {/* Cabeçalhos atualizados: Nome, Tipo, Secretaria, Status */}
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
                      hover // Adiciona efeito visual ao passar o mouse
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        cursor: "pointer", 
                        transition: "background-color 0.2s"
                      }}
                    >
                      {/* Coluna Nome */}
                      <TableCell component="th" scope="row" sx={{ color: "#4B5563", fontWeight: 500 }}>
                        {row.name}
                      </TableCell>

                      {/* Coluna Tipo */}
                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.type}
                      </TableCell>

                      {/* Coluna Secretaria */}
                      <TableCell sx={{ color: "#4B5563" }}>
                        {row.secretaria}
                      </TableCell>
                      
                      {/* Coluna Status */}
                      <TableCell>
                        <Chip 
                            label={statusConfig.label} 
                            size="small"
                            sx={{ 
                                bgcolor: statusConfig.color, 
                                color: statusConfig.textColor,
                                minWidth: 90,
                                fontSize: "0.85rem",
                               
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