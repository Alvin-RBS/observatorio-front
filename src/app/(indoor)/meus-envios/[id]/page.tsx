"use client";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  Divider,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  Snackbar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; 
import DownloadIcon from "@mui/icons-material/Download";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
// Importação voltando apenas um nível para encontrar o mock
import { MOCK_MEUS_ENVIOS, getStatusConfig, MeuEnvioItem } from "../mockMeusEnvios"; 

export default function VisualizarMeuEnvioPage() {
  const router = useRouter();
  const params = useParams(); 

  const [envioDetails, setEnvioDetails] = useState<MeuEnvioItem | null>(null);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);

  useEffect(() => {
    const envioId = Number(params.id);
    const envio = MOCK_MEUS_ENVIOS.find(e => e.id === envioId);
    if (envio) {
        setEnvioDetails(envio);
    }
  }, [params.id]);

  if (!envioDetails) return <Typography sx={{p: 4}}>Carregando...</Typography>;

  const statusConfig = getStatusConfig(envioDetails.status);
  const isError = envioDetails.status === "Erro";

  const handleDownloadOriginal = () => {
    // Retornando para o Caminho Feliz: dispara o alert de sucesso!
    alert(`Baixando o arquivo original: ${envioDetails.arquivoNome}`);
  };

  const handleExportErrorLog = () => {
    alert("Exportando log de erros em formato .CSV para correção.");
  };

  const handleCloseSnackbar = () => {
    setErrorSnackbarOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

       <Box mb={4} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => router.push("/meus-envios/historico")} sx={{ color: "#333" }}>
             <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            Detalhes do Envio
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        <Grid size={{xs: 12, md: 8}}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              border: "1px solid #b3bac9",
              transition: "all 0.3s ease",
              "&:hover": { 
                backgroundColor: "#F0F4FF", 
                borderColor: "#1E3A8A",
                transform: "translateY(-2px)",
                boxShadow: "0px 8px 24px rgba(30, 58, 138, 0.1)"
              }
            }}
          >
            
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#333" mb={1}>
                  {envioDetails.arquivoNome}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                  Ação: {envioDetails.tipoAcao}
                </Typography>
              </Box>

              <Chip 
                label={statusConfig.label} 
                sx={{ 
                  bgcolor: statusConfig.color, 
                  color: statusConfig.textColor,
                  fontWeight: "bold",
                  px: 3,
                  py: 2,
                  fontSize: "0.95rem"
                }} 
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.1)"}} />

            <Grid container spacing={2}>
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="body2" color="text.secondary">Data e Hora do Envio</Typography>
                <Typography variant="body1" fontWeight="500" color="#333">{envioDetails.dataHora}</Typography>
              </Grid>
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="body2" color="text.secondary">Linhas Processadas</Typography>
                <Typography variant="body1" fontWeight="500" color="#333">{envioDetails.linhasProcessadas}</Typography>
              </Grid>
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="body2" color="text.secondary">Registros Criados no Banco</Typography>
                <Typography variant="body1" fontWeight="500" color="#333">{envioDetails.registrosCriados}</Typography>
              </Grid>
            </Grid>

          </Paper>

          {isError && envioDetails.erros && (
            <Box mt={4}>
                <Typography variant="h6" fontWeight="bold" color="#991B1B" mb={2} display="flex" alignItems="center" gap={1}>
                    <WarningAmberIcon /> Logs de Falha de Processamento
                </Typography>
                <Paper elevation={0} sx={{ border: "1px solid #FCA5A5", borderRadius: 2, overflow: "hidden" }}>
                    {envioDetails.erros.map((erro, index) => (
                        <Alert 
                            key={index} 
                            severity="error" 
                            sx={{ 
                                borderRadius: 0, 
                                borderBottom: index === envioDetails.erros!.length - 1 ? "none" : "1px solid #FECACA",
                                bgcolor: "#FEF2F2",
                                color: "#991B1B"
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: "bold", mb: 0 }}>Linha {erro.linha}</AlertTitle>
                            {erro.descricao}
                        </Alert>
                    ))}
                </Paper>
            </Box>
          )}

        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Box display="flex" flexDirection="column" gap={2}>
            
            <Button 
              variant="outlined" 
              onClick={handleDownloadOriginal}
              startIcon={<DownloadIcon />}
              sx={{ 
                textTransform: "none", 
                borderColor: "#1E3A8A", 
                color: "#1E3A8A",
                fontWeight: "bold",
                py: 1.2, 
                borderWidth: "1.5px",
                "&:hover": { borderWidth: "1.5px", bgcolor: "#F3F4F6" }
              }}
            >
              Baixar arquivo original
            </Button>

            {isError && (
                <Button 
                    variant="contained" 
                    onClick={handleExportErrorLog}
                    startIcon={<WarningAmberIcon />}
                    sx={{ 
                        textTransform: "none", 
                        bgcolor: "#991B1B", 
                        color: "#FFF",
                        fontWeight: "bold",
                        py: 1.2, 
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#7F1D1D", boxShadow: "none" } 
                    }}
                >
                    Exportar Log de Erros
                </Button>
            )}

          </Box>
        </Grid>

      </Grid>

      {/* Mantive o Snackbar aqui caso precise ativar a simulação de erro no futuro */}
      <Snackbar 
        open={errorSnackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%', fontWeight: "bold" }}>
          O arquivo solicitado não está disponível no momento. Contate o suporte.
        </Alert>
      </Snackbar>

    </Container>
  );
}