"use client";

import { useState, ChangeEvent } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  Container,
  MenuItem,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  InputAdornment,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { isValidCPF } from "@/utils/validate";
import masks from "@/utils/mask";

const SECRETARIAS = ["SJDH", "SDS", "Saúde", "Educação"];
const TIPOS_USUARIO = ["Operador", "Gestor", "Admin"];
const STATUS_CONTA = ["Ativa", "Inativa", "Pendente"];

export default function AdicionarUsuarioPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    secretaria: "",
    tipoUsuario: "",
    status: "Ativa",
    dataCriacao: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<{ cpf?: string }>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const labelProps = {
    shrink: true,
    sx: { 
        backgroundColor: "white", 
        paddingX: 1, 
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === "cpf") {
      value = masks.cpf(e);
      if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: undefined }));
    }
    
    if (name === "telefone") {
      value = masks.phone(e);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const newErrors: { cpf?: string } = {};

    if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Dados válidos para enviar:", formData);
    router.push("/indoor/usuarios");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => router.back()} sx={{ color: "#333" }}>
             <ArrowBackIcon />
        </IconButton>
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            Adicionar usuário
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Informe os dados necessários para adicionar o usuário
            </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Grid container spacing={4}>
          
          <Grid size={{xs: 12}} display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Box position="relative">
                <Avatar src={photoPreview || undefined} sx={{ width: 120, height: 120, mb: 2, bgcolor: "#E0E0E0", border: "2px solid #fff" }} />
            </Box>
            <input accept="image/*" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handlePhotoChange} />
            <label htmlFor="raised-button-file">
                <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} sx={{ textTransform: "none", fontWeight: "bold" }}>
                    Carregar foto
                </Button>
            </label>
          </Grid>

          <Grid size={{xs: 12, md: 6}}>
            <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                    label="Nome completo"
                    name="nome"
                    placeholder="Alberto Alves da Silva"
                    value={formData.nome}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={labelProps} 
                />

                <TextField
                    label="E-mail"
                    name="email"
                    placeholder="alberto.alves@sjdh.com.br"
                    type="email"
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
                        <MenuItem value="" disabled>Selecione</MenuItem>
                        {SECRETARIAS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel shrink sx={{ bgcolor: "white", px: 1 }} id="status-label">
                        Status da conta do usuário
                    </InputLabel>
                    <Select
                        labelId="status-label"
                        name="status"
                        value={formData.status}
                        onChange={handleSelectChange}
                    >
                        {STATUS_CONTA.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
          </Grid>

          <Grid size={{xs: 12, md: 6}}>
             <Box display="flex" flexDirection="column" gap={3}>

                <TextField
                    label="CPF"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    placeholder="123.456.789-00"
                    InputLabelProps={labelProps} 
                    error={!!errors.cpf}
                    helperText={errors.cpf}
                    inputProps={{ maxLength: 14 }}
                />

                <TextField
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    placeholder="(81) 98123-4432"
                    InputLabelProps={labelProps} 
                    inputProps={{ maxLength: 15 }}
                />

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
                        <MenuItem value="" disabled>Selecione</MenuItem>
                        {TIPOS_USUARIO.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                </FormControl>

                <TextField
                    label="Data da criação da conta"
                    name="dataCriacao"
                    type="date"
                    value={formData.dataCriacao}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={labelProps} 
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                />
             </Box>
          </Grid>
        </Grid>

        <Box mt={4}>
            <Button 
                variant="contained"
                onClick={handleSubmit}
                sx={{ bgcolor: "#003380", py: 1, px: 4, fontWeight: "bold", textTransform: "none", "&:hover": { bgcolor: "#002255" }}}
            >
                Adicionar usuário
            </Button>
        </Box>

      </Paper>
    </Container>
  );
}