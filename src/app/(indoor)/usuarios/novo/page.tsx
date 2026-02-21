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
  FormHelperText // Import necessário para erro no Select
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
    status: "Ativa", // Valor padrão, então dificilmente estará vazio
    dataCriacao: new Date().toISOString().split('T')[0]
  });

  // Estado de erros agora aceita qualquer chave string
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
    }
    
    if (name === "telefone") {
      value = masks.phone(e);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa o erro específico do campo ao digitar
    if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));

    // Limpa o erro do select ao selecionar
    if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    // 1. Validação de Campos Vazios (Obrigatoriedade)
    // Lista de campos que não podem ser vazios
    const requiredFields = ["nome", "email", "cpf", "telefone", "secretaria", "tipoUsuario", "dataCriacao"];
    
    requiredFields.forEach((field) => {
        if (!formData[field as keyof typeof formData]) {
            newErrors[field] = "Campo obrigatório.";
        }
    });

    // 2. Validação Específica de CPF (só valida se tiver algo digitado)
    if (formData.cpf && !isValidCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido.";
    }

    // 3. Validação básica de E-mail
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "E-mail inválido.";
    }

    // Se houver erros, atualiza o estado e não envia
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Dados válidos para enviar:", formData);
    router.push("/usuarios/lista");
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
                    error={!!errors.nome} // Mostra vermelho se houver erro
                    helperText={errors.nome} // Mostra a mensagem
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
                    error={!!errors.email}
                    helperText={errors.email}
                />

                <FormControl fullWidth error={!!errors.secretaria}>
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
                    {/* Mensagem de erro para Select */}
                    {errors.secretaria && <FormHelperText>{errors.secretaria}</FormHelperText>}
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
                    error={!!errors.telefone}
                    helperText={errors.telefone}
                />

                <FormControl fullWidth error={!!errors.tipoUsuario}>
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
                    {errors.tipoUsuario && <FormHelperText>{errors.tipoUsuario}</FormHelperText>}
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
                    error={!!errors.dataCriacao}
                    helperText={errors.dataCriacao}
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