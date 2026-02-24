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
import masks from "@/utils/mask"; 
import { MOCK_USERS, getStatusConfig, UserItem } from "../mock"; 

const CURRENT_USER_ROLE = "Admin"; 
const SECRETARIAS = ["SJDH", "SDS", "Saúde", "Educação"];
const TIPOS_USUARIO = ["Operador", "Gestor", "Admin"];

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();

  const [userDetails, setUserDetails] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    secretaria: "",
    tipoUsuario: ""
  });

  useEffect(() => {
    const userId = Number(params.id);
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (user) {
        setUserDetails(user);
        setFormData({
            nome: user.name,
            cpf: user.cpf,
            email: user.email,
            telefone: user.telefone,
            secretaria: user.secretaria,
            tipoUsuario: user.type
        });
    }
  }, [params.id]);

  if (!userDetails) return <Typography sx={{p: 4}}>Carregando...</Typography>;

  const statusConfig = getStatusConfig(userDetails.status);

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
    const userIndex = MOCK_USERS.findIndex(u => u.id === Number(params.id));
    
    if (userIndex !== -1) {
      MOCK_USERS[userIndex] = {
        ...MOCK_USERS[userIndex],
        email: formData.email,
        telefone: formData.telefone,
        secretaria: formData.secretaria,
        type: formData.tipoUsuario
      };
    }

    router.push(`/usuarios/${params.id}`); 
  };

  const labelProps = {
    shrink: true,
    sx: { backgroundColor: "white", paddingX: 1 }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        {/* Setinha configurada para voltar à tela de visualização do ID atual */}
        <IconButton onClick={() => router.push(`/usuarios/${params.id}`)} sx={{ color: "#333" }}>
             <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            Editar informações
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={3} alignItems="center">
                <Avatar sx={{ width: 80, height: 80, bgcolor: "#E0E0E0" }} />
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="#333" mb={2} mt={0.5}>
                        {formData.nome || userDetails.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {formData.tipoUsuario || userDetails.type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        conta criada em {userDetails.createdAt}
                    </Typography>
                </Box>
            </Box>
            
            <Chip 
                label={statusConfig.label} 
                sx={{ 
                    bgcolor: statusConfig.color, 
                    color: statusConfig.textColor, 
                    fontWeight: "bold",
                    px: 3,
                    mt: 0.5
                }} 
            />
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid size={{xs: 12, md: 6}}>
            <Box display="flex" flexDirection="column" gap={3}>
                <TextField 
                  label="Nome completo" 
                  name="nome" 
                  value={formData.nome} 
                  disabled
                  fullWidth 
                  variant="outlined" 
                  InputLabelProps={labelProps} 
                  sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#6B7280", bgcolor: "#F9FAFB" } }}
                />
                
                <TextField label="E-mail" name="email" value={formData.email} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={labelProps} />
                <FormControl fullWidth>
                    <InputLabel shrink sx={{ bgcolor: "white", px: 1 }} id="secretaria-label">Secretaria</InputLabel>
                    <Select labelId="secretaria-label" name="secretaria" value={formData.secretaria} onChange={handleSelectChange} displayEmpty>
                        {SECRETARIAS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
            <Box display="flex" flexDirection="column" gap={3}>
                <TextField label="CPF" name="cpf" value={formData.cpf} disabled fullWidth variant="outlined" InputLabelProps={labelProps} sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#6B7280", bgcolor: "#F9FAFB" } }} />
                <TextField label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={labelProps} />
                {CURRENT_USER_ROLE === "Admin" && (
                    <FormControl fullWidth>
                        <InputLabel shrink sx={{ bgcolor: "white", px: 1 }} id="tipo-label">Tipo de usuário</InputLabel>
                        <Select labelId="tipo-label" name="tipoUsuario" value={formData.tipoUsuario} onChange={handleSelectChange} displayEmpty>
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
            sx={{ bgcolor: "#003380", py: 1, px: 6, fontWeight: "bold", textTransform: "none", "&:hover": { bgcolor: "#002255" }}}
        >
            Salvar
        </Button>
      </Box>

    </Container>
  );
}