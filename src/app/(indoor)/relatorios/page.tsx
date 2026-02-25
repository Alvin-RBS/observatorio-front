"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
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

// --- IMPORTS DINÂMICOS DOS GRÁFICOS (Padrão do Visualizar Dados) ---
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const PernambucoMap = dynamic(
  () => import("@/features/dashBoard/components/MapPe"), 
  { 
    ssr: false,
    loading: () => (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%" bgcolor="#F3F4F6">
        <Typography variant="caption" color="text.secondary">Carregando mapa...</Typography>
      </Box>
    )
  }
);

// --- HELPERS DE GRÁFICOS ---
const transformDataForMap = (chartData: ChartConfig): Record<string, number> => {
    const mapData: Record<string, number> = {};
    const categories = chartData.options?.xaxis?.categories || [];
    const values = chartData.series?.[0]?.data || [];
    categories.forEach((city: string | number, index: number) => {
        if (typeof city === 'string' && values[index] !== undefined) {
            mapData[city] = Number(values[index]);
        }
    });
    return mapData;
};

const getApexType = (customType: string): any => {
    if (customType === 'bar-horizontal' || customType === 'bar-vertical') return 'bar';
    if (customType === 'geomap') return 'bar'; 
    return customType;
};

// --- MOCKS DE DOMÍNIO ---
const MUNICIPIOS = ["Recife", "Olinda", "Jaboatão dos Guararapes", "Paulista", "Camaragibe"];
const FAIXAS_ETARIAS = ["0 a 17 anos", "18 a 29 anos", "30 a 59 anos", "60 anos ou mais"];
const SEXO = ["Feminino", "Masculino", "Outros", "Não informado"];

function CriarRelatorioContent() {
  const searchParams = useSearchParams();
  const { getChartsByIndicator } = useDashboard();
  
  const urlIndicatorId = searchParams.get("indicatorId");
  const initialId = urlIndicatorId && INDICATORS_DB.some(i => i.id === urlIndicatorId) 
        ? urlIndicatorId 
        : INDICATORS_DB[0]?.id || "";

  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(initialId);
  const [availableCharts, setAvailableCharts] = useState<ChartConfig[]>([]);
  const [graficosSelecionados, setGraficosSelecionados] = useState<string[]>([]);
  const [textoPersonalizado, setTextoPersonalizado] = useState("");
  
  const [filtros, setFiltros] = useState({
    dataInicial: "", dataFinal: "", municipio: "Recife", idade: "", sexo: "", numOcorrencias: ""
  });

  const [loading, setLoading] = useState(false);
  const [erroValidacao, setErroValidacao] = useState("");
  const [alertaSistema, setAlertaSistema] = useState<{ tipo: "error" | "warning" | "info", msg: string } | null>(null);

  const currentIndicator = INDICATORS_DB.find(i => i.id === selectedIndicatorId);

  useEffect(() => {
    if (selectedIndicatorId) {
      const charts = getChartsByIndicator(selectedIndicatorId);
      setAvailableCharts(charts);
      setGraficosSelecionados([]); 
    }
  }, [selectedIndicatorId, getChartsByIndicator]);

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
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>Gerar Relatório</Typography>
        <Typography variant="body1" color="text.secondary" mt={0.5}>
          Selecione o indicador, configure os filtros e adicione os gráficos para compor o seu documento.
        </Typography>
      </Box>

      {alertaSistema && <Alert severity={alertaSistema.tipo} sx={{ mb: 4, fontWeight: "bold" }}>{alertaSistema.msg}</Alert>}

      <Grid container spacing={4}>
        {/* COLUNA ESQUERDA: PAINEL */}
        <Grid size={{xs: 12, md: 5, lg: 4}}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
            <Typography variant="h6" fontWeight="bold" color="#1E3A8A" mb={3}>Parâmetros Básicos</Typography>
            <Box display="flex" flexDirection="column" gap={3}>
              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: "white", px: 1 }}>Indicador Analítico</InputLabel>
                <Select value={selectedIndicatorId} onChange={(e) => setSelectedIndicatorId(e.target.value)} sx={{ bgcolor: "#F8FAFC", fontWeight: "bold" }}>
                    {INDICATORS_DB.map((indicator) => <MenuItem key={indicator.id} value={indicator.id}>{indicator.label}</MenuItem>)}
                </Select>
              </FormControl>
              <Divider />
              <Box display="flex" gap={2}>
                <TextField label="Data Inicial" name="dataInicial" type="date" value={filtros.dataInicial} onChange={handleFiltroChange} onBlur={validarDatas} fullWidth InputLabelProps={labelProps} error={!!erroValidacao} />
                <TextField label="Data Final" name="dataFinal" type="date" value={filtros.dataFinal} onChange={handleFiltroChange} onBlur={validarDatas} fullWidth InputLabelProps={labelProps} error={!!erroValidacao} />
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
            </Box>

            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" fontWeight="bold" color="#1E3A8A" mb={1}>Gráficos do Indicador</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {availableCharts.length > 0 ? (
                  availableCharts.map(chart => (
                    <FormControlLabel 
                      key={chart.id}
                      control={<Checkbox checked={graficosSelecionados.includes(chart.id)} onChange={() => handleCheckboxChange(chart.id)} sx={{ color: "#1E3A8A", '&.Mui-checked': { color: "#1E3A8A" } }} />} 
                      label={<Typography variant="body2">{chart.title}</Typography>} 
                    />
                  ))
              ) : <Typography variant="body2" color="error">Nenhum gráfico encontrado.</Typography>}
            </Box>
          </Paper>
        </Grid>

        {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO COM GRÁFICOS REAIS */}
        <Grid size={{xs: 12, md: 7, lg: 8}}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px dashed #9CA3AF", minHeight: "100%", display: "flex", flexDirection: "column" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold" color="#333" display="flex" alignItems="center" gap={1}>
                <VisibilityIcon color="action" /> Visualização do Documento
              </Typography>
              <Chip label="Rascunho" size="small" sx={{ bgcolor: "#F3F4F6", color: "#4B5563", fontWeight: "bold" }} />
            </Box>
            <Divider sx={{ mb: 4 }} />

            <Box mb={4} textAlign="center">
              <Typography variant="h4" fontWeight="bold" color="#111827" mb={1}>
                Relatório: {currentIndicator?.label || "Selecione um Indicador"}
              </Typography>
              <Typography variant="body1" color="text.secondary">{filtros.municipio || "Todos os Municípios"}</Typography>
              <Typography variant="caption" color="text.secondary">
                {filtros.dataInicial ? `Período: ${filtros.dataInicial} até ${filtros.dataFinal || 'Hoje'}` : "Período: Todo o histórico disponível"}
              </Typography>
            </Box>

            <Box mb={4} flexGrow={1}>
              <Typography variant="subtitle2" fontWeight="bold" color="#374151" mb={1}>Considerações e Análise Qualitativa</Typography>
              <TextField fullWidth multiline rows={4} placeholder="Escreva aqui a sua análise técnica..." value={textoPersonalizado} onChange={(e) => setTextoPersonalizado(e.target.value)} sx={{ bgcolor: "#F9FAFB", "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </Box>

            {/* RENDERIZAÇÃO REAL DOS GRÁFICOS SELECIONADOS */}
            {graficosSelecionados.length > 0 && (
              <Box mb={4}>
                <Typography variant="subtitle2" fontWeight="bold" color="#374151" mb={2}>Anexos Visuais Selecionados ({graficosSelecionados.length})</Typography>
                <Grid container spacing={2}>
                  {graficosSelecionados.map(id => {
                    const chart = availableCharts.find(x => x.id === id);
                    if (!chart) return null;
                    
                    const mapDataForPreview = chart.type === 'geomap' ? transformDataForMap(chart) : {};
                    const previewOptions = {
                        ...chart.options,
                        chart: { ...chart.options?.chart, toolbar: { show: false } }
                    };

                    return (
                      <Grid size={{xs: 12, sm: 6}} key={id}>
                        <Paper sx={{ p: 2, height: 280, display: "flex", flexDirection: "column", borderRadius: 2, border: "1px solid #E5E7EB", elevation: 0 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1} noWrap>
                                {chart.title}
                            </Typography>
                            <Box flexGrow={1} sx={{ position: "relative", minHeight: 0 }}>
                                {chart.type === 'geomap' ? (
                                    <Box sx={{ position: "absolute", inset: 0 }}>
                                        <PernambucoMap dataMap={mapDataForPreview} />
                                    </Box>
                                ) : (
                                    <Box sx={{ position: "absolute", inset: 0 }}>
                                        <Chart options={previewOptions} series={chart.series} type={getApexType(chart.type)} height="100%" width="100%" />
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}

            <Divider sx={{ mt: "auto", mb: 3 }} />

            {/* BOTÕES DINÂMICOS OTIMIZADOS */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="contained" onClick={() => handleGerarRelatorio("PDF")} disabled={!!erroValidacao || loading || !selectedIndicatorId} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />} sx={{ textTransform: "none", fontWeight: "bold", bgcolor: "#1E3A8A", px: 4, "&:hover": { bgcolor: "#1E40AF" } }}>
                {loading ? "A processar..." : `Gerar Relatório - ${currentIndicator?.label || ''}`}
              </Button>
            </Box>

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function CriarRelatorioPage() {
    return (
        <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress sx={{ color: "#1E3A8A" }} /></Box>}>
            <CriarRelatorioContent />
        </Suspense>
    );
}