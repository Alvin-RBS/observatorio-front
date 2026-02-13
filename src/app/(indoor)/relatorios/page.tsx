"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Container,
  Divider,
  SxProps,
  Theme,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from "@mui/icons-material/PieChart";

// --- DADOS MOCKADOS ---
const MUNICIPIOS = ["Recife", "Olinda", "Jaboatão", "Caruaru"];
const BAIRROS = ["Graças", "Boa Viagem", "Casa Forte", "Derby"];
const NATUREZAS = ["Homicídio", "Roubo", "Furto", "Tráfico"];
const IDADES = ["18-24", "25-34", "35-44", "+45"];
const SEXOS = ["Masculino", "Feminino", "Outro"];
const OCORRENCIAS = ["1", "2-5", "+5"];

export default function RelatoriosPage() {
  const [formData, setFormData] = useState({
    dataInicio: "2025-01-01",
    dataFim: "2025-01-30",
    municipio: "Recife",
    bairro: "Graças",
    natureza: "",
    idade: "",
    sexo: "",
    ocorrencias: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- ESTILO PARA CORRIGIR O BUG DA LINHA NO SELECT ---
  // Aplica um fundo branco ao label quando ele flutua, cobrindo a linha do input.
  const selectFieldStyle: SxProps<Theme> = {
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      backgroundColor: "#FFFFFF",
      paddingInline: "4px", // Um pequeno respiro nas laterais do texto
    },
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF", // CORREÇÃO 2: Fundo branco puro
      }}
    >
      <Box mb={4}>
        {/* CORREÇÃO 1: Cor do título original (#333) */}
        <Typography variant="h4" fontWeight="bold" color="#333">
          Geração de Relatórios
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Configure os filtros abaixo para customizar a exportação de dados do
          Observatório.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        {/* --- COLUNA DA ESQUERDA (FILTROS) --- */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Paper
            elevation={0} // Removi a elevação alta para ficar mais limpo no fundo branco
            sx={{
              p: 4,
              borderRadius: 3,
              height: "100%",
              border: "1px solid #E0E0E0", // Borda sutil para delimitar no fundo branco
            }}
          >
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{ mb: 3, color: "#333" }}
            >
              Filtros de Seleção
            </Typography>

            <Grid container spacing={3}>
              {/* Grupo de Datas */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="text.secondary"
                  mb={1}
                >
                  Período de Análise
                </Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    label="Data Início"
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="Data Fim"
                    type="date"
                    name="dataFim"
                    value={formData.dataFim}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* Localização */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Município"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  sx={selectFieldStyle} // CORREÇÃO 3: Aplicando a correção do bug
                >
                  {MUNICIPIOS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  sx={selectFieldStyle} // CORREÇÃO 3
                >
                  {BAIRROS.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Natureza */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Natureza Jurídica"
                  name="natureza"
                  value={formData.natureza}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  helperText="Selecione o tipo de crime ou ocorrência"
                  sx={selectFieldStyle} // CORREÇÃO 3
                >
                  {NATUREZAS.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Perfil */}
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Idade"
                  name="idade"
                  value={formData.idade}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  sx={selectFieldStyle} // CORREÇÃO 3
                >
                  {IDADES.map((i) => (
                    <MenuItem key={i} value={i}>
                      {i}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  sx={selectFieldStyle} // CORREÇÃO 3
                >
                  {SEXOS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Ocorrências */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Número de Ocorrências"
                  name="ocorrencias"
                  value={formData.ocorrencias}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  sx={selectFieldStyle} // CORREÇÃO 3
                >
                  {OCORRENCIAS.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* --- COLUNA DA DIREITA (PRÉ-VISUALIZAÇÃO) --- */}
        <Grid
          size={{ xs: 12, md: 7, lg: 8 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight="600" color="#333">
              Pré-visualização dos Dados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              A visualização atualiza automaticamente
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              flexGrow: 1,
            }}
          >
            {/* Placeholder Gráfico 1 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#F8FAFC", // Mantive um cinza muito leve apenas nos placeholders para contraste
                border: "1px dashed #cbd5e1",
                borderRadius: 3,
                height: "45%",
                minHeight: "250px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <AssessmentIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="body2" fontWeight="medium">
                Gráfico Temporal de Ocorrências
              </Typography>
              <Typography variant="caption">
                (Aguardando geração de relatório)
              </Typography>
            </Paper>

            {/* Placeholder Gráfico 2 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#F8FAFC",
                border: "1px dashed #cbd5e1",
                borderRadius: 3,
                height: "45%",
                minHeight: "250px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <PieChartIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="body2" fontWeight="medium">
                Distribuição por Natureza Jurídica
              </Typography>
              <Typography variant="caption">
                (Aguardando geração de relatório)
              </Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* --- FOOTER DE AÇÃO --- */}
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          bottom: 0,
          mt: 4,
          p: 2,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          bgcolor: "#FFFFFF", // Fundo branco no footer também
        }}
      >
        <Button
          variant="outlined"
          sx={{
            px: 4,
            fontWeight: "600",
            textTransform: "none",
            borderColor: "#1E3A8A",
            color: "#1E3A8A",
          }}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          sx={{
            px: 5,
            fontWeight: "bold",
            textTransform: "none",
            bgcolor: "#0D47A1",
            "&:hover": { bgcolor: "#002171" },
          }}
        >
          Gerar Relatório
        </Button>
      </Paper>
    </Container>
  );
}