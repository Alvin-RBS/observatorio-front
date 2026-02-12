"use client";

import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Container, 
  Stack,
  Grid 
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter(); 

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
                  Entrar no observatório
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Seja bem-vindo!
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* LADO DIREITO: Formulário de Login */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Paper
              elevation={4} 
              sx={{
                p: 4, 
                borderRadius: 2, 
                bgcolor: "white",
              }}
            >
              <Box component="form" onSubmit={(e) => { e.preventDefault(); router.push('/home'); }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Login
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Insira suas informações de cadastro.
                </Typography>

                <Stack spacing={2.5}>
                  
                  <TextField
                    label="E-mail"
                    variant="outlined"
                    type="email"
                    fullWidth
                    size="small" 
                    required
                  />
                  
                  <TextField
                    label="Senha"
                    variant="outlined"
                    type="password"
                    fullWidth
                    size="small"
                    required
                  />

                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Continuar Logado
                      </Typography>
                    }
                  />

                 <Stack spacing={2}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      color="primary" 
                      onClick={() => router.push('/recuperar-senha')}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                           bgcolor: '#F5F9FF' 
                        }
                      }}
                    >
                      Esqueci minha senha
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      fullWidth
                      color="primary"
                      type="submit" 
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        '&:hover': {
                           bgcolor: '#002244' 
                        }
                      }}
                    >
                      Entrar
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}