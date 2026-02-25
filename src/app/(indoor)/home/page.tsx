"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  Select, 
  MenuItem, 
  FormControl,
  CircularProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DescriptionIcon from "@mui/icons-material/Description";
import SecurityIcon from "@mui/icons-material/Security"; 
import LocalPoliceIcon from "@mui/icons-material/LocalPolice"; 
import SearchOffIcon from '@mui/icons-material/SearchOff';

import { useRouter } from "next/navigation";
import { useFile } from "@/context/FileContext"; 
import { useDashboard, ChartConfig } from "@/context/DashboardContext";
import { INDICATORS_DB } from "@/data/indicatorsConfig"; 
import { getAttributeValues } from "@/data/domainValues";

// --- IMPORTS DO SERVIÇO E ADAPTADORES ---
import {
  getAggregatedData,
  transformToApexXYSeries,
  transformToApexPieSeries,
  transformToApexMatrixSeries,
  transformToGeomapSeries,
  DashboardRequestDTO
} from "@/features/dashBoard/services/dashboardService";

// --- IMPORTS DINÂMICOS DOS GRÁFICOS ---
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
    // Se o backend já enviou no formato de dicionário { "Recife": 10 }, usamos direto:
    if (chartData.series && !Array.isArray(chartData.series) && typeof chartData.series === 'object') {
        return chartData.series as unknown as Record<string, number>;
    }
    return {};
};

const getApexType = (customType: string): any => {
    if (customType === 'bar-horizontal' || customType === 'bar-vertical') return 'bar';
    if (customType === 'geomap') return 'bar'; 
    return customType;
};

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUploadedFile } = useFile();
  const { getChartsByIndicator } = useDashboard();

  // Estados principais
  const [highlightedIndicator, setHighlightedIndicator] = useState(INDICATORS_DB?.[0]?.id || "1");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  // Novos estados para gerenciar os dados reais dos gráficos na Home
  const [loadedCharts, setLoadedCharts] = useState<ChartConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentIndicatorData = useMemo(() => 
    INDICATORS_DB?.find(i => i.id === highlightedIndicator), 
  [highlightedIndicator]);

  const previewCharts = useMemo(() => 
    getChartsByIndicator(highlightedIndicator).slice(0, 3),
  [highlightedIndicator, getChartsByIndicator]);

  const dynamicFilterInputs = useMemo(() => {
    if (!currentIndicatorData) return [];
    
    const municipioAttr = currentIndicatorData.calculationAttributes.find(a => a.id === 'municipio');
    const contextAttributes = currentIndicatorData.contextAttributes.filter(attr => attr.id !== 'data' && attr.id !== 'ano');
    const combinedAttributes = municipioAttr ? [municipioAttr, ...contextAttributes] : contextAttributes;
    
    return combinedAttributes.map(attr => ({
        label: attr.label,
        key: attr.id,
        options: getAttributeValues(attr.id)
    }));
  }, [currentIndicatorData]);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedFile(file);
      router.push("/meus-envios/adicionar"); 
    }
  };

  const handleGoToReport = (indicatorId: string) => {
    router.push(`/relatorios?indicatorId=${indicatorId}`);
  };

  // ==========================================
  // EFEITO: BUSCAR DADOS REAIS PARA OS GRÁFICOS DA HOME
  // ==========================================
  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!previewCharts || previewCharts.length === 0) {
        setLoadedCharts([]);
        return;
      }

      setIsLoading(true);
      try {
        const updatedCharts = await Promise.all(
          previewCharts.map(async (chartTemplate) => {
            // 1. Interseção Inteligente de Filtros (Gráfico vs Global da Home)
            const mergedFilters: Record<string, string> = { ...chartTemplate.chartFilters };

            Object.keys(activeFilters).forEach((key) => {
              const globalValue = activeFilters[key];
              if (!globalValue || globalValue.trim() === "") return;

              if (mergedFilters[key]) {
                const chartVals = mergedFilters[key].split(",").map((v) => v.trim().toUpperCase());
                const globalVals = globalValue.split(",").map((v) => v.trim().toUpperCase());
                const intersection = chartVals.filter((v) => globalVals.includes(v));
                mergedFilters[key] = intersection.length > 0 ? intersection.join(",") : "__NONE__";
              } else {
                mergedFilters[key] = globalValue;
              }
            });

            // 2. Chama o Mock
            const payload: DashboardRequestDTO = {
              indicatorId: highlightedIndicator,
              filters: mergedFilters,
              groupBy: chartTemplate.groupBy || [],
              metrics: chartTemplate.metrics || [],
            };

            const data = await getAggregatedData(payload);

            // 3. Adapta os dados retornados para o formato do ApexCharts
            let newSeries: any = [];
            const newOptions = { ...chartTemplate.options };

            const safeGroupBy = chartTemplate.groupBy || [];

            if (chartTemplate.type === "line" || chartTemplate.type === "bar" || chartTemplate.type === "area" || chartTemplate.type === "bar-horizontal") {
              const xAxis = safeGroupBy[0];
              const seriesAttr = safeGroupBy[1];
              const adapted = transformToApexXYSeries(data, xAxis, seriesAttr);
              newSeries = adapted.series;
              newOptions.xaxis = { ...newOptions.xaxis, categories: adapted.categories };
            } else if (chartTemplate.type === "pie" || chartTemplate.type === "donut") {
              const labelAttr = safeGroupBy[0];
              const adapted = transformToApexPieSeries(data, labelAttr);
              newSeries = adapted.series;
              newOptions.labels = adapted.labels;
            } else if (chartTemplate.type === "geomap") {
              const locationAttr = safeGroupBy[0] || "municipio";
              newSeries = transformToGeomapSeries(data, locationAttr);
            } else if (chartTemplate.type === "heatmap") {
              const xAxis = safeGroupBy[0];
              const yAxis = safeGroupBy[1];
              const adapted = transformToApexMatrixSeries(data, xAxis, yAxis);
              newSeries = adapted.series;
            }

            return {
              ...chartTemplate,
              series: newSeries,
              options: newOptions,
            };
          })
        );

        setLoadedCharts(updatedCharts);
      } catch (error) {
        console.error("Erro ao carregar preview dos gráficos", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedIndicator, activeFilters]);

  // ==========================================
  // RENDERIZAÇÃO DA PÁGINA
  // ==========================================
  return (
    <Box sx={{ pb: 4, pt: 2 }}>
      
      {/* 1. BARRA DE FILTROS GLOBAIS DA HOME */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: "#F8FAFC" }}>
                <AssessmentIcon color="action" sx={{ ml: 1 }} />
                <FormControl fullWidth variant="standard" sx={{ ml: 1 }}>
                    <Select 
                        disableUnderline 
                        value={highlightedIndicator}
                        onChange={(e) => {
                            setHighlightedIndicator(e.target.value);
                            setActiveFilters({}); 
                        }}
                        sx={{ fontWeight: "bold", color: "#1E3A8A" }}
                    >
                        {INDICATORS_DB?.map(ind => (
                            <MenuItem key={ind.id} value={ind.id}>{ind.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>
        </Grid>

        {dynamicFilterInputs.slice(0, 3).map((filter) => (
            <Grid size={{ xs: 12, md: 2 }} key={filter.key} sx={{ flexGrow: 1 }}>
                <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, minWidth: 50 }}>
                        {filter.label}:
                    </Typography>
                    <Select 
                        fullWidth 
                        variant="standard" 
                        disableUnderline 
                        displayEmpty
                        value={activeFilters[filter.key] || ""}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        sx={{ fontWeight: 500, fontSize: "0.85rem" }}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {filter.options.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>
                </Paper>
            </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" color="#333">
            Panorama: {currentIndicatorData?.label || "Ocorrências gerais"}
        </Typography>
        <Button 
            variant="text" 
            onClick={() => router.push(`/visualizar-dados?indicatorId=${highlightedIndicator}`)}
            sx={{ fontWeight: "bold", textTransform: "none", color: "#1E3A8A" }}
        >
            Ver dashboard completo
        </Button>
      </Box>

      {/* 2. PRÉVIA DO DASHBOARD */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loadedCharts.map((chart) => {
            const mapDataForPreview = chart.type === 'geomap' ? transformDataForMap(chart) : {};
            const previewOptions = {
                ...chart.options,
                chart: { ...chart.options?.chart, toolbar: { show: false } }
            };

            // Avalia se o mock retornou vazio devido a filtros excludentes
            const isChartEmpty = 
                !chart.series || 
                (Array.isArray(chart.series) && chart.series.length === 0) || 
                (Array.isArray(chart.series[0]?.data) && chart.series[0].data.length === 0) ||
                (chart.type === 'geomap' && Object.keys(chart.series || {}).length === 0);

            return (
                <Grid size={{ xs: 12, md: 4 }} key={chart.id}>
                    <Paper sx={{ p: 3, height: 320, display: "flex", flexDirection: "column", borderRadius: 3, border: "1px solid #E5E7EB", elevation: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom noWrap>
                            {chart.title}
                        </Typography>
                        
                        <Box flexGrow={1} sx={{ position: "relative", minHeight: 0, mt: 1 }}>
                            {isLoading ? (
                                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <CircularProgress size={30} sx={{ color: '#9CA3AF' }} />
                                </Box>
                            ) : isChartEmpty ? (
                                <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#F9FAFB", border: "2px dashed #D1D5DB", borderRadius: 2 }}>
                                    <SearchOffIcon sx={{ fontSize: 36, mb: 1, color: '#9CA3AF' }} />
                                    <Typography variant="caption" color="text.secondary">Nenhum dado encontrado</Typography>
                                </Box>
                            ) : chart.type === 'geomap' ? (
                                <Box sx={{ position: "absolute", inset: 0, borderRadius: 2, overflow: "hidden" }}>
                                    <PernambucoMap dataMap={mapDataForPreview} />
                                </Box>
                            ) : (
                                <Box sx={{ position: "absolute", inset: 0 }}>
                                    <Chart 
                                        options={previewOptions} 
                                        series={chart.series} 
                                        type={getApexType(chart.type)} 
                                        height="100%" 
                                        width="100%" 
                                    />
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            );
        })}

        {previewCharts.length === 0 && !isLoading && (
            <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px dashed #9CA3AF", bgcolor: "#F9FAFB", elevation: 0 }}>
                    <Typography color="text.secondary">Nenhum gráfico disponível para o panorama deste indicador.</Typography>
                </Paper>
            </Grid>
        )}
      </Grid>

      {/* 3. AÇÕES RÁPIDAS */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{ p: 4, borderRadius: 3, bgcolor: "white", height: "100%", display: "flex", flexDirection: "column", border: "1px solid #E5E7EB" }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Adicionar nova base de dados
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Faça o upload dos arquivos para integrar novos dados ao observatório.
            </Typography>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onFileChange} 
                style={{ display: 'none' }} 
                accept=".csv, .xlsx, .pdf"
            />

            <Box
              onClick={handlePickFile}
              sx={{ flexGrow: 1, border: "2px dashed #93C5FD", borderRadius: 2, bgcolor: "#EFF6FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, gap: 2, cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: "#DBEAFE", borderColor: "#3B82F6" } }}
            >
              <CloudUploadIcon sx={{ fontSize: 60, color: "#2563EB" }} />
              <Button 
                variant="contained" 
                size="large"
                onClick={(e) => { e.stopPropagation(); handlePickFile(); }}
                sx={{ bgcolor: "#1E3A8A", textTransform: "none", fontWeight: "bold", px: 4, "&:hover": { bgcolor: "#1E40AF" } }}
              >
                Escolher arquivo
              </Button>
              <Typography variant="caption" color="text.secondary" fontWeight="500">
                Formatos aceitos: .XLSX, .CSV, .PDF
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 , md: 7 }}>
            <Paper elevation={0} sx={{ p: 4, height: "100%", borderRadius: 3, border: "1px solid #E5E7EB" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                     <Typography variant="h6" fontWeight="bold">Geração Rápida de Relatórios</Typography>
                     <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleGoToReport(highlightedIndicator)}
                        sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: "#1E3A8A", color: "#1E3A8A" }}
                     >
                        Montar relatório personalizado
                     </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={4}>
                    Selecione um dos atalhos abaixo para ir direto para a extração do documento.
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Button 
                            variant="outlined" fullWidth 
                            onClick={() => handleGoToReport("1")}
                            startIcon={<DescriptionIcon color="action" />} 
                            sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: '#4B5563', borderColor: '#E5E7EB', fontWeight: 500, "&:hover": { bgcolor: "#F9FAFB" } }}
                        >
                            CVLI
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                         <Button 
                            variant="outlined" fullWidth 
                            onClick={() => handleGoToReport("2")}
                            startIcon={<SecurityIcon color="action" />} 
                            sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: '#4B5563', borderColor: '#E5E7EB', fontWeight: 500, "&:hover": { bgcolor: "#F9FAFB" } }}
                        >
                            Feminicídio
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                         <Button 
                            variant="outlined" fullWidth 
                            onClick={() => handleGoToReport("3")}
                            startIcon={<LocalPoliceIcon color="action" />} 
                            sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: '#4B5563', borderColor: '#E5E7EB', fontWeight: 500, "&:hover": { bgcolor: "#F9FAFB" } }}
                        >
                            Apreensão de Armas de Fogo
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                         <Button 
                            variant="outlined" fullWidth 
                            onClick={() => handleGoToReport("4")}
                            startIcon={<SecurityIcon color="action" />} 
                            sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: '#4B5563', borderColor: '#E5E7EB', fontWeight: 500, "&:hover": { bgcolor: "#F9FAFB" } }}
                        >
                            Roubo de transeunte
                        </Button>
                    </Grid>
                     <Grid size={{ xs: 12, sm: 12 }}>
                         <Button 
                            variant="outlined" fullWidth 
                            onClick={() => handleGoToReport("5")}
                            startIcon={<DescriptionIcon color="action" />} 
                            sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none', color: '#4B5563', borderColor: '#E5E7EB', fontWeight: 500, "&:hover": { bgcolor: "#F9FAFB" } }}
                        >
                            Homicídios de 18 a 29 anos
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}