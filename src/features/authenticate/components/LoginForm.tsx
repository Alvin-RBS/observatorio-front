"use client";

import { useState } from "react";
import { TextField, Button, Box, Alert } from "@mui/material";
import { useApiMutation } from "@/hooks/useApiMutation"; 
// import { authService } from "../services/authService"; (Futuramente)

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Simulação de login para teste visual
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login com:", email, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      
      <TextField
        label="E-mail"
        variant="outlined"
        type="email"
        fullWidth
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Senha"
        variant="outlined"
        type="password"
        fullWidth
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button 
        type="submit" 
        variant="contained" 
        size="large" 
        fullWidth
        sx={{ py: 1.5, fontWeight: "bold" }}
      >
        Entrar
      </Button>
    </Box>
  );
}