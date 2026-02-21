"use client";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; 
import { IconButton } from "@mui/material"; 
import { useRouter, useParams } from "next/navigation";

import { useState } from "react";


// --- DADOS MOCKADOS ---
const USER_DETAILS = {
  id: 1,
  nome: "Alberto Santos Alves",
  role: "Operador",
  dataCriacao: "02/02/2026",
  email: "alberto.santos@sjdh.com",
  cpf: "123.456.789.00",
  telefone: "(81) 91234-5678",
  secretaria: "SJDH",
  dataInativacao: null, 
  status: "Ativo",
  avatarUrl: null 
};

export default function VisualizarUsuarioPage() {
  const router = useRouter();
  const params = useParams(); 

  const [openModal, setOpenModal] = useState(false);

  const handleInactivate = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleConfirmInactivate = () => {
    console.log("Usuário inativado!");
    setOpenModal(false);
    router.push("/usuarios/lista");
  };

  const handleEdit = () => {
    router.push(`/usuarios/${params.id}/editar`);
  };


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

       <Box mb={4} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => router.back()} sx={{ color: "#333" }}>
             <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            Visualizar usuário
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- COLUNA ESQUERDA: CARD DE DETALHES --- */}
        <Grid size={{xs: 12, md: 8}}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, border: "1px solid #b3bac9" }}>
            
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box display="flex" gap={3}>
                <Avatar 
                  src={USER_DETAILS.avatarUrl || undefined}
                  sx={{ width: 80, height: 80, bgcolor: "#E0E0E0" }}
                />
                
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#333" mb={2} mt={0.5}>
                    {USER_DETAILS.nome}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight="500">
                    {USER_DETAILS.role}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    conta criada em {USER_DETAILS.dataCriacao}
                  </Typography>
                </Box>
              </Box>

              <Chip 
                label={USER_DETAILS.status} 
                sx={{ 
                  bgcolor: "#55E398", 
                  color: "#3F3F3F",
                  px: 3,
                  mt: 0.5
                }} 
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: "#000000"}} />

            <Box display="flex" flexDirection="column" gap={2}>
              
              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>E-mail:</strong> {USER_DETAILS.email}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>CPF:</strong> {USER_DETAILS.cpf}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>Telefone:</strong> {USER_DETAILS.telefone}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>Secretaria:</strong> {USER_DETAILS.secretaria}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>Data de inativação da conta:</strong> {USER_DETAILS.dataInativacao || "conta não foi inativada"}
              </Typography>

            </Box>

          </Paper>
        </Grid>

        {/* --- COLUNA DIREITA: BOTÕES DE AÇÃO --- */}
        <Grid size={{xs: 12, md: 4}}>
          <Box display="flex" flexDirection="column" gap={2}>
            
            <Button 
              variant="outlined" 
              onClick={handleEdit}
              sx={{ 
                textTransform: "none", 
                borderColor: "#1E3A8A", 
                color: "#1E3A8A",
                fontWeight: "bold",
                py: 1.5,
                borderWidth: "1.5px",
                "&:hover": { borderWidth: "1.5px", bgcolor: "#F3F4F6" }
              }}
            >
              Editar informações
            </Button>

            <Button 
              variant="outlined" 
              onClick={handleInactivate}
              sx={{ 
                textTransform: "none", 
                borderColor: "#1E3A8A", 
                color: "#1E3A8A",
                fontWeight: "bold",
                py: 1.5,
                borderWidth: "1.5px",
                "&:hover": { borderWidth: "1.5px", bgcolor: "#F3F4F6" }
              }}
            >
              Inativar usuário
            </Button>

          </Box>
        </Grid>

      </Grid>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
            sx: { borderRadius: 2, padding: 2, maxWidth: 500 }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: "center", fontSize: "1.5rem", color: "#333" }}>
          {"Desativar usuário?"}
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ textAlign: "center", color: "#666" }}>
            Essa ação pode ser revertida posteriormente, se necessário.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 2 }}>
          {/* Botão Cancelar */}
          <Button 
          variant="outlined"
            onClick={handleCloseModal} 
            sx={{ 
                color: "primary", 
                fontWeight: "bold",
                textTransform: "uppercase",
            }}
          >
            Cancelar
          </Button>

          <Button 
            onClick={handleConfirmInactivate} 
            variant="contained"
            autoFocus
            sx={{ 
                bgcolor: "primary", 
                color: "#fff",
                fontWeight: "bold",
                textTransform: "uppercase",
                px: 3,
                boxShadow: "none",
                "&:hover": { bgcolor: "#060959" }
            }}
          >
            Desativar usuário
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}