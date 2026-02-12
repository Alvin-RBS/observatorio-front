"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Grid 
} from "@mui/material"; 

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";


function SuccessModal({ open, onClose, email }: { open: boolean; onClose: () => void; email: string }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.2)", 
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          boxShadow: "0px 10px 40px rgba(0,0,0,0.2)",
          textAlign: "center"
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end">
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0, pb: 4 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#2E7D32", mb: 2 }} />
        
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#333">
          E-mail enviado!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enviamos as instruções de redefinição para:<br/>
          <strong>{email}</strong>
        </Typography>

        <Button 
          variant="contained" 
          fullWidth
          onClick={onClose}
          sx={{ 
            bgcolor: "#003B88", 
            textTransform: 'none', 
            fontWeight: 600,
            py: 1.2 
          }}
        >
          Voltar para o Login
        </Button>
      </DialogContent>
    </Dialog>
  );
}


export default function RecoverPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSend = async () => {
    if (!email) return;

    setLoading(true);

    try {
      // Simulação da chamada ao Gateway
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setModalOpen(true);
    } catch (error) {
      console.error("Erro ao enviar", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    router.push("/login"); 
  };

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
                 />
              </Box>

              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" color="#333">
                  Recuperar acesso
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Esqueceu sua senha? Não se preocupe.
                </Typography>
              </Box>
            </Box>
          </Grid>

        
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Paper
              elevation={4} 
              sx={{
                p: 4, 
                borderRadius: 2, 
                bgcolor: "white",
              }}
            >
              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Redefinir Senha
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Insira o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    label="E-mail"
                    variant="outlined"
                    type="email"
                    fullWidth
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Stack spacing={2}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      type="submit"
                      disabled={loading}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        bgcolor: '#003B88', 
                        '&:hover': { bgcolor: '#002244' }
                      }}
                    >
                      {loading ? "Enviando..." : "Enviar Instruções"}
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
                        '&:hover': { bgcolor: '#F5F9FF' }
                      }}
                    >
                      Voltar para o Login
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>

        </Grid>
      </Container>

      <SuccessModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        email={email} 
      />

    </Box>
  );
}