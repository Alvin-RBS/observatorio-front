"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  SelectChangeEvent,
  CircularProgress,
  Chip
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSearchParams, useRouter } from "next/navigation";

// --- IMPORTAÇÕES DO SEU ECOSSISTEMA ---
import { INDICATORS_DB } from "@/data/indicatorsConfig";
import { useDashboard, ChartConfig } from "@/context/DashboardContext";
// Caso tenha um arquivo com as listas suspensas (domínios), você pode importá-lo. 
// Para este exemplo, deixei os valores locais para não quebrar a tela.
const MUNICIPIOS = ["Recife", "Olinda", "Jaboatão dos Guararapes", "Paulista", "Camaragibe"];
const FAIXAS_ETARIAS = ["0 a 17 anos", "18 a 29 anos", "30 a 59 anos", "60 anos ou mais"];
const SEXO = ["Feminino", "Masculino", "Outros", "Não informado"];

function CriarRelatorioContent() {
  const searchParams = useSearchParams();
  const { getChartsByIndicator } = useDashboard();
  
  // 1. Tenta pegar o ID da URL (Fluxo FA-01.01). Se não, usa o primeiro indicador disponível.
  const urlIndicatorId = searchParams.get("indicatorId");
  const initialId = urlIndicatorId && INDICATORS_DB.some(i => i.id === urlIndicatorId) 
        ? urlIndicatorId 
        : INDICATORS_DB[0]?.id || "";

  // --- ESTADOS ---
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(initialId);
  const [availableCharts, setAvailableCharts] = useState<ChartConfig[]>([]);
  const [graficosSelecionados, setGraficosSelecionados] = useState<string[]>([]);
  const [textoPersonalizado, setTextoPersonalizado] = useState("");
  
  const [filtros, setFiltros] = useState({
    dataInicial: "",
    dataFinal: "",
    municipio: "Recife",
    idade: "",
    sexo: "",
    numOcorrencias: ""
  });

  const [loading, setLoading] = useState(false);
  const [erroValidacao, setErroValidacao] = useState("");
  const [alertaSistema, setAlertaSistema] = useState<{ tipo: "error" | "warning" | "info", msg: string } | null>(null);

  const currentIndicator = INDICATORS_DB.find(i => i.id === selectedIndicatorId);

  // --- EFEITOS ---
  // Atualiza a lista de gráficos disponíveis sempre que o indicador muda
  useEffect(() => {
    if (selectedIndicatorId) {
      const charts = getChartsByIndicator(selectedIndicatorId);
      setAvailableCharts(charts);
      setGraficosSelecionados([]); // Limpa a seleção ao trocar de indicador
    }
  }, [selectedIndicatorId, getChartsByIndicator]);


  // --- HANDLERS ---
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
    setErroValidacao(""); 
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id: string) => {
    setGraficosSelecionados(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const validarDatas = () => {
    if (!filtros.dataInicial || !filtros.dataFinal) return true;

    const dtInicial = new Date(filtros.dataInicial);
    const dtFinal = new Date(filtros.dataFinal);
    const hoje = new Date();

    if (dtInicial > dtFinal) {
      setErroValidacao("A data inicial não pode ser maior que a data final.");
      return false;
    }
    if (dtInicial > hoje || dtFinal > hoje) {
      setErroValidacao("Não é possível gerar relatórios para datas futuras.");
      return false;
    }

    setErroValidacao("");
    return true;
  };

  const handleGerarRelatorio = (tipo: "PDF" | "CSV") => {
    setAlertaSistema(null);
    if (!validarDatas()) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (filtros.dataInicial.startsWith("2024") || filtros.dataInicial.startsWith("2025")) {
        setAlertaSistema({ tipo: "info", msg: "Não foram encontrados registros para os filtros selecionados." });
        return;
      }

      if (Number(filtros.numOcorrencias) > 10000) {
        setAlertaSistema({ tipo: "warning", msg: "O relatório é muito extenso para ser gerado de uma vez. Por favor, diminua o período de tempo ou filtre por uma região específica." });
        return;
      }

      alert(`Relatório do indicador "${currentIndicator?.label}" gerado em ${tipo} com sucesso!`);
    }, 1500);
  };

  const labelProps = { shrink: true, sx: { bgcolor: "white", px: 1 } };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
          Gerar Relatório
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={0.5}>
          Selecione o indicador, configure os filtros e adicione os gráficos para compor o seu documento.
        </Typography>
      </Box>

      {alertaSistema && (
        <Alert severity={alertaSistema.tipo} sx={{ mb: 4, fontWeight: "bold" }}>
          {alertaSistema.msg}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* --- COLUNA ESQUERDA: PAINEL DE CONTROLE --- */}
        <Grid size={{xs: 12, md: 5, lg: 4}}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
            
            <Typography variant="h6" fontWeight="bold" color="#1E3A8A" mb={3}>
              Parâmetros Básicos
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
              
              {/* 1. SELEÇÃO DE INDICADOR */}
              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: "white", px: 1 }}>Indicador Analítico</InputLabel>
                <Select 
                    value={selectedIndicatorId} 
                    onChange={(e) => setSelectedIndicatorId(e.target.value)}
                    sx={{ bgcolor: "#F8FAFC", fontWeight: "bold" }}
                >
                    {INDICATORS_DB.map((indicator) => (
                        <MenuItem key={indicator.id} value={indicator.id}>
                            {indicator.label}
                        </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <Divider />

              {/* 2. FILTROS DE TEMPO E LOCAL */}
              <Box display="flex" gap={2}>
                <TextField 
                  label="Data Inicial" 
                  name="dataInicial" 
                  type="date" 
                  value={filtros.dataInicial} 
                  onChange={handleFiltroChange} 
                  onBlur={validarDatas}
                  fullWidth 
                  InputLabelProps={labelProps} 
                  error={!!erroValidacao}
                />
                <TextField 
                  label="Data Final" 
                  name="dataFinal" 
                  type="date" 
                  value={filtros.dataFinal} 
                  onChange={handleFiltroChange} 
                  onBlur={validarDatas}
                  fullWidth 
                  InputLabelProps={labelProps} 
                  error={!!erroValidacao}
                />
              </Box>
              {erroValidacao && <Typography color="error" variant="caption" mt={-2}>{erroValidacao}</Typography>}

              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: "white", px: 1 }}>Município</InputLabel>
                <Select name="municipio" value={filtros.municipio} onChange={handleSelectChange} displayEmpty>
                  <MenuItem value="">Todos</MenuItem>
                  {MUNICIPIOS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>

              <Box display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel shrink sx={{ bgcolor: "white", px: 1 }}>Idade</InputLabel>
                  <Select name="idade" value={filtros.idade} onChange={handleSelectChange} displayEmpty>
                    <MenuItem value="">Todas</MenuItem>
                    {FAIXAS_ETARIAS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel shrink sx={{ bgcolor: "white", px: 1 }}>Sexo</InputLabel>
                  <Select name="sexo" value={filtros.sexo} onChange={handleSelectChange} displayEmpty>
                    <MenuItem value="">Todos</MenuItem>
                    {SEXO.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <TextField 
                label="Limite de Ocorrências" 
                name="numOcorrencias" 
                type="number"
                placeholder="Ex: 5000"
                value={filtros.numOcorrencias} 
                onChange={handleFiltroChange} 
                fullWidth 
                InputLabelProps={labelProps} 
              />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* 3. SELEÇÃO DE GRÁFICOS (Baseado no contexto) */}
            <Typography variant="h6" fontWeight="bold" color="#1E3A8A" mb={1}>
              Gráficos do Indicador
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Selecione quais gráficos do Dashboard devem constar no relatório:
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={1}>
              {availableCharts.length > 0 ? (
                  availableCharts.map(chart => (
                    <FormControlLabel 
                      key={chart.id}
                      control={
                        <Checkbox 
                          checked={graficosSelecionados.includes(chart.id)}
                          onChange={() => handleCheckboxChange(chart.id)}
                          sx={{ color: "#1E3A8A", '&.Mui-checked': { color: "#1E3A8A" } }}
                        />
                      } 
                      label={<Typography variant="body2">{chart.title}</Typography>} 
                    />
                  ))
              ) : (
                  <Typography variant="body2" color="error">
                      Nenhum gráfico encontrado para este indicador.
                  </Typography>
              )}
            </Box>

          </Paper>
        </Grid>

        {/* --- COLUNA DIREITA: PRÉ-VISUALIZAÇÃO --- */}
        <Grid size={{xs: 12, md: 7, lg: 8}}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px dashed #9CA3AF", minHeight: "100%", display: "flex", flexDirection: "column" }}>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold" color="#333" display="flex" alignItems="center" gap={1}>
                <VisibilityIcon color="action" /> Visualização do Documento
              </Typography>
              <Chip label="Rascunho" size="small" sx={{ bgcolor: "#F3F4F6", color: "#4B5563", fontWeight: "bold" }} />
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Cabeçalho Fictício do Relatório */}
            <Box mb={4} textAlign="center">
              <Typography variant="h4" fontWeight="bold" color="#111827" mb={1}>
                Relatório: {currentIndicator?.label || "Selecione um Indicador"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {filtros.municipio || "Todos os Municípios"} 
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filtros.dataInicial ? `Período: ${filtros.dataInicial} até ${filtros.dataFinal || 'Hoje'}` : "Período: Todo o histórico disponível"}
              </Typography>
            </Box>

            {/* Inserção de Texto (RN06) */}
            <Box mb={4} flexGrow={1}>
              <Typography variant="subtitle2" fontWeight="bold" color="#374151" mb={1}>
                Considerações e Análise Qualitativa
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Escreva aqui a sua análise técnica, conclusões ou introdução para este relatório..."
                value={textoPersonalizado}
                onChange={(e) => setTextoPersonalizado(e.target.value)}
                sx={{ bgcolor: "#F9FAFB", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>

            {/* Gráficos na Prévia */}
            {graficosSelecionados.length > 0 && (
              <Box mb={4}>
                <Typography variant="subtitle2" fontWeight="bold" color="#374151" mb={2}>
                  Anexos Visuais Selecionados ({graficosSelecionados.length})
                </Typography>
                <Grid container spacing={2}>
                  {graficosSelecionados.map(id => {
                    const chart = availableCharts.find(x => x.id === id);
                    return (
                      <Grid size={{xs: 12, sm: 6}} key={id}>
                        <Box sx={{ p: 2, bgcolor: "#F3F4F6", borderRadius: 1, border: "1px solid #E5E7EB", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", height: 120 }}>
                          <Typography variant="body2" fontWeight="bold" color="#1E3A8A">{chart?.title}</Typography>
                          <Typography variant="caption" color="text.secondary">Gráfico do tipo: {chart?.type}</Typography>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}

            <Divider sx={{ mt: "auto", mb: 3 }} />

            {/* Botões de Ação Final */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={() => handleGerarRelatorio("CSV")}
                disabled={!!erroValidacao || loading}
                startIcon={<TableChartIcon />}
                sx={{ textTransform: "none", fontWeight: "bold", borderColor: "#10B981", color: "#10B981", "&:hover": { bgcolor: "#ECFDF5", borderColor: "#059669" } }}
              >
                Exportar Dados Brutos (CSV)
              </Button>
              <Button 
                variant="contained" 
                onClick={() => handleGerarRelatorio("PDF")}
                disabled={!!erroValidacao || loading || !selectedIndicatorId}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                sx={{ textTransform: "none", fontWeight: "bold", bgcolor: "#1E3A8A", px: 4, "&:hover": { bgcolor: "#1E40AF" } }}
              >
                {loading ? "A processar..." : "Gerar Relatório PDF"}
              </Button>
            </Box>

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// Para usar o useSearchParams no Next.js (App Router), precisamos envolver o componente em um Suspense
export default function CriarRelatorioPage() {
    return (
        <Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress sx={{ color: "#1E3A8A" }} />
            </Box>
        }>
            <CriarRelatorioContent />
        </Suspense>
    );
}