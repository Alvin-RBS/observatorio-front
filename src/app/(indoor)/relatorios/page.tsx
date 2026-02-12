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
  FormControl,
  Select,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";

// --- DADOS MOCKADOS  ---
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
    ocorrencias: ""
  });

  const handleChange = (
  e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name as string]: value }));
};

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: "100vh", display: "flex", flexDirection: "column" }}>
      
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        
        {/* --- COLUNA DA ESQUERDA (FILTROS) --- */}
        <Grid size={{xs:12, md:6, lg:5}}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "#333" }}>
            Selecione indicadores
          </Typography>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: "1px solid #E0E0E0", 
              borderRadius: 2,
              height: "100%", 
              maxHeight: "750px"
            }}
          >
            <Grid container spacing={2} mb={3}>
              <Grid size={{xs:12, sm:8}}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Período de visualização
                </Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    type="date"
                    name="dataFim"
                    value={formData.dataFim}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Box>
              </Grid>
              
              <Grid size={{xs:6, sm:4}}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Município
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    displayEmpty
                  >
                    {MUNICIPIOS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>Bairro</Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                >
                  {BAIRROS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>Natureza Jurídica</Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="natureza"
                  value={formData.natureza}
                  onChange={handleChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em style={{ color: "#aaa", fontStyle: "normal" }}>Selecione a natureza jurídica</em>;
                    }
                    return selected;
                  }}
                >
                  <MenuItem disabled value=""><em>Selecione a natureza jurídica</em></MenuItem>
                  {NATUREZAS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2} mb={3}>
              <Grid size={{xs:6}}>
                <Typography variant="body2" color="text.secondary" mb={1}>Idade</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="idade"
                    value={formData.idade}
                    onChange={handleChange}
                    displayEmpty
                    renderValue={(sel) => sel || <span style={{ color: "#aaa" }}>Selecione</span>}
                  >
                    {IDADES.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs:6}}>
                <Typography variant="body2" color="text.secondary" mb={1}>Sexo</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    displayEmpty
                    renderValue={(sel) => sel || <span style={{ color: "#aaa" }}>Selecione</span>}
                  >
                    {SEXOS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>Número de Ocorrências</Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="ocorrencias"
                  value={formData.ocorrencias}
                  onChange={handleChange}
                  displayEmpty
                  renderValue={(sel) => sel || <span style={{ color: "#aaa" }}>Selecione</span>}
                >
                  {OCORRENCIAS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

          </Paper>
        </Grid>

        {/* --- COLUNA DA DIREITA (PRÉ-VISUALIZAÇÃO) --- */}
        <Grid size={{xs:12, md:6, lg:7}} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "#333" }}>
            Pré-visualização
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
             <Paper 
                elevation={0} 
                sx={{ 
                    bgcolor: "#F3F4F6", 
                    borderRadius: 2, 
                    height: "45%", 
                    minHeight: "250px"
                }} 
             />

             <Paper 
                elevation={0} 
                sx={{ 
                    bgcolor: "#F3F4F6", 
                    borderRadius: 2, 
                    height: "45%", 
                    minHeight: "250px"
                }} 
             />
          </Box>
        </Grid>

      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, mb: 2 }}>
        <Button 
            variant="outlined" 
            sx={{ 
                textTransform: "none", 
                borderColor: "#1E3A8A", 
                color: "#1E3A8A",
                px: 4,
                fontWeight: "bold"
            }}
        >
          Voltar
        </Button>
        <Button 
            variant="contained" 
            sx={{ 
                textTransform: "none", 
                bgcolor: "#0D47A1", 
                px: 4,
                fontWeight: "bold",
                "&:hover": { bgcolor: "#002171" }
            }}
        >
          Gerar relatório
        </Button>
      </Box>

    </Container>
  );
}