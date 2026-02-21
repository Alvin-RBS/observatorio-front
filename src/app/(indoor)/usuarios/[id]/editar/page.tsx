"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  SelectChangeEvent
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter, useParams } from "next/navigation";
import masks from "@/utils/mask"; // Reutilizando suas máscaras

// --- DADOS MOCKADOS (Simulando o usuário logado e o usuário a ser editado) ---

// Mude isso para "Gestor" ou "Operador" para testar a Regra 1
const CURRENT_USER_ROLE = "Admin"; 

const MOCK_USER_TO_EDIT = {
  id: 1,
  nome: "Alberto Santos Alves",
  cpf: "123.456.789.00",
  email: "albertosantos@sjdh.com",
  telefone: "(81) 91234-5678",
  secretaria: "SJDH",
  tipoUsuario: "Operador",
  status: "Ativo", // Para o badge verde
  dataCriacao: "02/02/2026",
  avatarUrl: null
};

const SECRETARIAS = ["SJDH", "SDS", "Saúde", "Educação"];
const TIPOS_USUARIO = ["Operador", "Gestor", "Admin"];

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    secretaria: "",
    tipoUsuario: ""
  });


  useEffect(() => {
    setFormData({
      nome: MOCK_USER_TO_EDIT.nome,
      cpf: MOCK_USER_TO_EDIT.cpf,
      email: MOCK_USER_TO_EDIT.email,
      telefone: MOCK_USER_TO_EDIT.telefone,
      secretaria: MOCK_USER_TO_EDIT.secretaria,
      tipoUsuario: MOCK_USER_TO_EDIT.tipoUsuario
    });
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === "telefone") {
      value = masks.phone(e);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSave = () => {
    console.log("Dados atualizados:", formData);

    alert("Usuário atualizado com sucesso!");
    router.push(`/usuarios/${params.id}`); 
  };

  const labelProps = {
    shrink: true,
    sx: { backgroundColor: "white", paddingX: 1 }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      {/* Cabeçalho */}
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => router.back()} sx={{ color: "#333" }}>
             <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            Editar informações
        </Typography>
      </Box>

      {/* --- CARTÃO DE RESUMO DO USUÁRIO (Topo) --- */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={3} alignItems="center">
                <Avatar 
                    src={MOCK_USER_TO_EDIT.avatarUrl || undefined}
                    sx={{ width: 80, height: 80, bgcolor: "#E0E0E0" }}
                />
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="#333" mb={2} mt={0.5}>
                        {MOCK_USER_TO_EDIT.nome}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {MOCK_USER_TO_EDIT.tipoUsuario}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        conta criada em {MOCK_USER_TO_EDIT.dataCriacao}
                    </Typography>
                </Box>
            </Box>
            
            <Chip 
                label={MOCK_USER_TO_EDIT.status} 
                sx={{ 
                    bgcolor: "#55E398", 
                    color: "#3F3F3F", 
                    px: 3,
                    mt: 0.5
                }} 
            />

        </Box>
      </Paper>

      {/* --- FORMULÁRIO --- */}
      <Grid container spacing={4}>
        
        {/* Coluna Esquerda */}
        <Grid size={{xs: 12, md: 6}}>
            <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                    label="Nome completo"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={labelProps}
                />

                <TextField
                    label="E-mail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={labelProps}
                />

                <FormControl fullWidth>
                    <InputLabel shrink sx={{ bgcolor: "white", px: 1 }} id="secretaria-label">
                        Secretaria
                    </InputLabel>
                    <Select
                        labelId="secretaria-label"
                        name="secretaria"
                        value={formData.secretaria}
                        onChange={handleSelectChange}
                        displayEmpty
                    >
                        {SECRETARIAS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
        </Grid>

        {/* Coluna Direita */}
        <Grid size={{xs: 12, md: 6}}>
            <Box display="flex" flexDirection="column" gap={3}>
                

                <TextField
                    label="CPF"
                    name="cpf"
                    value={formData.cpf}
                    disabled 
                    fullWidth
                    variant="outlined"
                    InputLabelProps={labelProps}
                    sx={{ 
                        "& .MuiInputBase-input.Mui-disabled": { 
                            WebkitTextFillColor: "#6B7280", 
                            bgcolor: "#F9FAFB" 
                        } 
                    }}
                />

                <TextField
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={labelProps}
                />

                {CURRENT_USER_ROLE === "Admin" && (
                    <FormControl fullWidth>
                        <InputLabel shrink sx={{ bgcolor: "white", px: 1 }} id="tipo-label">
                            Tipo de usuário
                        </InputLabel>
                        <Select
                            labelId="tipo-label"
                            name="tipoUsuario"
                            value={formData.tipoUsuario}
                            onChange={handleSelectChange}
                            displayEmpty
                        >
                            {TIPOS_USUARIO.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                )}

            </Box>
        </Grid>
      </Grid>

      <Box mt={6}>
        <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{ 
                bgcolor: "#003380", 
                py: 1, 
                px: 6, 
                fontWeight: "bold", 
                textTransform: "none",
                "&:hover": { bgcolor: "#002255" }
            }}
        >
            Salvar
        </Button>
      </Box>

    </Container>
  );
}