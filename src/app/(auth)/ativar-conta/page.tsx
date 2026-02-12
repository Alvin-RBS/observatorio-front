"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Stack,
  Grid,
  InputAdornment,
  IconButton
} from "@mui/material"; 

// Ícones para mostrar/ocultar senha
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Componente interno para o formulário (necessário para usar useSearchParams com Suspense)
function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // O token que vem na URL do e-mail

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    setLoading(true);

    try {
      // ======================================================
      // TODO: INTEGRAÇÃO COM BACKEND
      // await api.post('/auth/activate-account', { token, password });
      // ======================================================
      
      console.log("Ativando conta com token:", token, "e senha:", password);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula API
      
      alert("Conta ativada com sucesso!");
      router.push("/login");

    } catch (error) {
      console.error("Erro ao ativar", error);
      alert("Erro ao ativar conta. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleActivate}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
            Ativar Conta
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
            Olá! Para finalizar seu cadastro, crie uma senha segura para acessar o observatório.
        </Typography>

        <Stack spacing={2.5}>
            
            <TextField
                label="Nova Senha"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                size="small"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
            />
            
            <TextField
                label="Confirmar Senha"
                variant="outlined"
                type={showPassword ? "text" : "password"} // Usa o mesmo estado para facilitar
                fullWidth
                size="small"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Stack spacing={2}>
                <Button 
                    variant="contained" 
                    fullWidth
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.2,
                    bgcolor: '#003B88',
                    '&:hover': {
                        bgcolor: '#002244' 
                    }
                    }}
                >
                    {loading ? "Ativando..." : "Ativar minha conta"}
                </Button>

                <Button 
                    variant="text" 
                    fullWidth
                    type="button"
                    onClick={() => router.push("/login")}
                    sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    color: 'text.secondary',
                    '&:hover': {
                        bgcolor: '#F5F9FF' 
                    }
                    }}
                >
                    Cancelar
                </Button>
            </Stack>
        </Stack>
    </Box>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function ActivateAccountPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fafcfe 0%, #a0b7d7 110%)",
        p: 2, 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          
          {/* LADO ESQUERDO: Logo e Título */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ width: 150, height: 'auto' }}>
                 <Image 
                   src="/logos/Logo-pernambuco.png" 
                   alt="Governo de Pernambuco" 
                   width={150} 
                   height={80} 
                   style={{ objectFit: 'contain' }} 
                   priority
                 />
              </Box>

              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" color="#333">
                  Bem-vindo(a)!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Você está a um passo de acessar o Observatório de Dados.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* LADO DIREITO: Card do Formulário */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Paper
              elevation={4} 
              sx={{
                p: 4, 
                borderRadius: 2, 
                bgcolor: "white",
              }}
            >
              {/* Suspense é necessário porque usamos useSearchParams */}
              <Suspense fallback={<Typography>Carregando...</Typography>}>
                <ActivateAccountForm />
              </Suspense>
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}