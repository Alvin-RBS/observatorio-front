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
  DialogActions,
  IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; 
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MOCK_USERS, getStatusConfig, UserItem } from "./mock"; 

export default function VisualizarUsuarioPage() {
  const router = useRouter();
  const params = useParams(); 

  const [openModal, setOpenModal] = useState(false);
  const [userDetails, setUserDetails] = useState<UserItem | null>(null);

  useEffect(() => {
    const userId = Number(params.id);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        setUserDetails(user);
    }
  }, [params.id]);

  if (!userDetails) return <Typography sx={{p: 4}}>Carregando...</Typography>;

  const statusConfig = getStatusConfig(userDetails.status);
  
  let actionLabel = "";
  let actionColor = "";
  let hoverBg = "";
  let hoverText = "";
  let hoverBorder = "";
  let modalTitle = "";
  let modalText = "";
  let nextStatus: "Ativa" | "Desativado" | "Pendente" = "Ativa";

  if (userDetails.status === "Pendente") {
    actionLabel = "Aprovar usuário";
    actionColor = "#059669"; 
    hoverBg = "#D1FAE5";
    hoverText = "#065F46";
    hoverBorder = "#065F46";
    modalTitle = "Aprovar usuário?";
    modalText = "O usuário terá o seu acesso liberado ao sistema.";
    nextStatus = "Ativa";
  } else if (userDetails.status === "Desativado") {
    actionLabel = "Reativar usuário";
    actionColor = "#059669"; 
    hoverBg = "#D1FAE5";
    hoverText = "#065F46";
    hoverBorder = "#065F46";
    modalTitle = "Reativar usuário?";
    modalText = "O usuário voltará a ter acesso ao sistema.";
    nextStatus = "Ativa";
  } else {
    actionLabel = "Inativar usuário";
    actionColor = "#1E3A8A"; 
    hoverBg = "#FEE2E2"; 
    hoverText = "#991B1B";
    hoverBorder = "#991B1B";
    modalTitle = "Desativar usuário?";
    modalText = "Essa ação pode ser revertida posteriormente, se necessário.";
    nextStatus = "Desativado";
  }

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleConfirmStatusChange = () => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === Number(params.id));
    
    if (userIndex !== -1) {
      MOCK_USERS[userIndex].status = nextStatus;
      
      if (nextStatus === "Desativado") {
        const hoje = new Date().toLocaleDateString('pt-BR');
        MOCK_USERS[userIndex].inactivatedAt = hoje;
      } else {
        MOCK_USERS[userIndex].inactivatedAt = null;
      }
      
      setUserDetails({ ...MOCK_USERS[userIndex] });
    }

    setOpenModal(false);
  };

  const handleEdit = () => {
    router.push(`/usuarios/${params.id}/editar`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

       <Box mb={4} display="flex" alignItems="center" gap={2}>
        {/* Setinha configurada para voltar à lista de usuários */}
        <IconButton onClick={() => router.push("/usuarios/lista")} sx={{ color: "#333" }}>
             <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            Visualizar usuário
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
              <Box display="flex" gap={3}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: "#E0E0E0" }} />
                
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#333" mb={2} mt={0.5}>
                    {userDetails.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight="500">
                    {userDetails.type}
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

            <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.1)"}} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>E-mail:</strong> {userDetails.email}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>CPF:</strong> {userDetails.cpf}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>Telefone:</strong> {userDetails.telefone}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>Secretaria:</strong> {userDetails.secretaria}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong style={{ color: "#4B5563" }}>Data de inativação da conta:</strong> {userDetails.inactivatedAt || "conta não foi inativada"}
              </Typography>
            </Box>

          </Paper>
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Box display="flex" flexDirection="column" gap={2}>
            
            <Button 
              variant="outlined" 
              onClick={handleEdit}
              size="medium"
              sx={{ 
                textTransform: "none", 
                borderColor: "#1E3A8A", 
                color: "#1E3A8A",
                fontWeight: "bold",
                py: 0.8, 
                borderWidth: "1.5px",
                "&:hover": { borderWidth: "1.5px", bgcolor: "#F3F4F6" }
              }}
            >
              Editar informações
            </Button>

            <Button 
              variant="outlined" 
              onClick={handleOpenModal}
              size="medium"
              sx={{ 
                textTransform: "none", 
                borderColor: actionColor, 
                color: actionColor,
                fontWeight: "bold",
                py: 0.8, 
                borderWidth: "1.5px",
                "&:hover": { 
                    borderWidth: "1.5px", 
                    bgcolor: hoverBg, 
                    color: hoverText, 
                    borderColor: hoverBorder 
                } 
              }}
            >
              {actionLabel}
            </Button>

          </Box>
        </Grid>

      </Grid>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        PaperProps={{ sx: { borderRadius: 2, padding: 2, maxWidth: 500 } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: "center", fontSize: "1.5rem", color: "#333" }}>
          {modalTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ textAlign: "center", color: "#666" }}>
            {modalText}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={handleCloseModal} sx={{ color: "primary", fontWeight: "bold", textTransform: "uppercase" }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            variant="contained" 
            autoFocus 
            sx={{ 
                bgcolor: actionColor, 
                color: "#fff", 
                fontWeight: "bold", 
                textTransform: "uppercase", 
                px: 3, 
                boxShadow: "none", 
                "&:hover": { bgcolor: hoverText } 
            }}
          >
            {actionLabel}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}