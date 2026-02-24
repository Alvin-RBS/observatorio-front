"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Link,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  TextField
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import SearchIcon from "@mui/icons-material/Search";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"; 
import CloseIcon from "@mui/icons-material/Close";
import MapIcon from "@mui/icons-material/Map"; 
import { useRouter } from "next/navigation";
import { INDICATORS_DB } from "@/data/indicatorsConfig";
import { getAttributeValues } from "@/data/domainValues";
import { fetchFilteredCharts } from "@/service/api";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { useDashboard, ChartConfig } from "@/context/DashboardContext";

// --- IMPORTS DINÂMICOS (Lazy Loading) ---
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

// --- HELPERS ---
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

// --- COMPONENTE DE CARD DE GRÁFICO ---
const ChartCard = ({ 
  data, 
  onZoom, 
  provided, 
  snapshot,
  isReordering
}: { 
  data: ChartConfig, 
  onZoom: (data: ChartConfig) => void,
  provided: any 
  snapshot: DraggableStateSnapshot
  isReordering: boolean
}) => {
  
  const mapData = useMemo(() => transformDataForMap(data), [data]);
  const showPlaceholder = snapshot.isDragging || isReordering;

  return (
    <Paper 
      ref={provided.innerRef}
      {...provided.draggableProps}
      elevation={snapshot.isDragging ? 6 : 0}
      sx={{ 
        minWidth: 400,
        p: 2, 
        borderRadius: 2, 
        border: "1px solid #E5E7EB",
        borderColor: snapshot.isDragging ? "primary.main" : "#E5E7EB",
        display: "flex",
        flexDirection: "column",
        height: 320,
        bgcolor: "white",
        mr: 3 
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
          {data.title}
        </Typography>
        <Box display="flex" alignItems="center">
           <IconButton size="small" onClick={() => onZoom(data)}>
              <SearchIcon fontSize="small" />
           </IconButton>
           <Box 
              {...provided.dragHandleProps} 
              sx={{ cursor: "grab", display: "flex", alignItems: "center" }}
           >
              <DragIndicatorIcon fontSize="small" color="action" />
           </Box>
        </Box>
      </Box>
      <Box flexGrow={1} position="relative" overflow="hidden">
          {/* LÓGICA DE RENDERIZAÇÃO CONDICIONAL */}
          {data.type === 'geomap' ? (
             showPlaceholder ? (
                <Box 
                    sx={{ 
                        width: "100%", 
                        height: "100%", 
                        bgcolor: "#F8FAFC", 
                        borderRadius: 2,
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        flexDirection: "column",
                        color: "#94A3B8",
                        border: snapshot.isDragging ? "none" : "1px dashed #E2E8F0"
                    }}
                >
                    <MapIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="caption" fontWeight="bold">
                        {snapshot.isDragging ? "Movendo mapa..." : "Carregando..."}
                    </Typography>
                </Box>
             ) : (
                <PernambucoMap dataMap={mapData} />
             )
          ) : (
             <Chart 
                options={data.options} 
                series={data.series} 
                type={getApexType(data.type)} 
                height="100%" 
             />
          )}
      </Box>
    </Paper>
  );
};
interface FilterConfig {
  label: string;
  key: string;
  options: string[];
}

// 2. Componente da LINHA DO INDICADOR
const IndicatorRow = ({ 
    title, contextFilters, initialCharts, indicatorId, type, multiplier
}: { 
    title: string, contextFilters: FilterConfig[], initialCharts: ChartConfig[], indicatorId: string, type: 'ABSOLUTE' | 'RATE', multiplier?: number,       
}) => {
  const router = useRouter();
  const { updateChartOrder } = useDashboard();
  
  const [charts, setCharts] = useState<ChartConfig[]>(initialCharts);
  const [isReordering, setIsReordering] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [expandedChart, setExpandedChart] = useState<ChartConfig | null>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  useMemo(() => {
    setCharts(initialCharts);
  }, [initialCharts]);

  // Memoiza dados para o modal de zoom (para não recalcular mapa no render do modal)
  const expandedMapData = useMemo(() => {
    if (expandedChart && expandedChart.type === 'geomap') {
        return transformDataForMap(expandedChart);
    }
    return {};
  }, [expandedChart]);

  const [filters, setFilters] = useState<Record<string, string>>({
    inicio: "2025-01-01",
    fim: new Date().toISOString().split('T')[0], ...contextFilters.reduce((acc, curr) => ({ ...acc, [curr.key]: "" }), {})});

  const handleFilterChange = (e: any) => {setFilters({ ...filters, [e.target.name]: e.target.value });};

  const onDragStart = () => { setIsReordering(true);};

  const onDragEnd = (result: DropResult) => {
    setIsReordering(false);

    if (!result.destination) return;

    const items = Array.from(charts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCharts(items);

    if (updateChartOrder) {
        updateChartOrder(indicatorId, items);
    }
  };

  const getChipConfig = () => {
      if (type === 'ABSOLUTE') {
          return { label: 'Número Absoluto', bgcolor: '#fcfee0', color: '#c7b602' }; // Azul suave
      }
      
      const kValue = multiplier && multiplier >= 1000 ? `${multiplier / 1000} mil` : multiplier;
      return { 
          label: `Taxa/${kValue}`, 
          bgcolor: '#E6EDF5', 
          color: '#003380' // 
      };
  };

  const chipConfig = getChipConfig();

  useEffect(() => {
      const loadFilteredData = async () => {
          setIsFiltering(true);
          try {
              const data = await fetchFilteredCharts(indicatorId, filters);
              setCharts(data);
          } catch (error) {
              console.error(`Erro ao buscar dados do servidor para o indicador ${indicatorId}:`, error);
          } finally {
              setIsFiltering(false);
          }
      };

      if (indicatorId) {
          loadFilteredData();
      }
  }, [filters, indicatorId]);
  

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: "#F3F4F6", borderRadius: 2 }}>
      
      {/* 3. CABEÇALHO  */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" fontWeight="bold" color="#333">
              {title}
            </Typography>
            <Chip 
                label={chipConfig.label} 
                size="small" 
                sx={{ 
                    bgcolor: chipConfig.bgcolor, 
                    color: chipConfig.color, 
                    fontWeight: "bold", 
                    fontSize: "0.75rem",
                    borderRadius: 1.5
                }} 
            />
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
                onClick={() => setIsGridModalOpen(true)} 
                size="small" 
                title="Visão de relatório (Grade)"
                sx={{ color: "#1E3A8A", bgcolor: "rgba(30, 58, 138, 0.05)", "&:hover": { bgcolor: "rgba(30, 58, 138, 0.1)" } }}
            >
                <GridViewIcon fontSize="small" />
            </IconButton>
            
            <Link 
                component="button"
                onClick={() => router.push(`/visualizar-dados/custom?indicatorId=${indicatorId}`)} 
                underline="hover"
                sx={{ fontWeight: "bold", color: "#1E3A8A", fontSize: "0.9rem" }}
            >
              Customizar dashboard
            </Link>
        </Box>
      </Box>

      {/* --- FILTROS DINÂMICOS --- */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Período de visualização</Typography>
            <Box display="flex" gap={2}>
                {/* CALENDÁRIO INICIAL DINÂMICO */}
                <TextField 
                    type="date"
                    fullWidth 
                    size="small" 
                    name="inicio"
                    value={filters.inicio}
                    onChange={handleFilterChange}
                    sx={{ bgcolor: "white" }}
                />
                
                {/* CALENDÁRIO FINAL DINÂMICO */}
                <TextField 
                    type="date"
                    fullWidth 
                    size="small" 
                    name="fim"
                    value={filters.fim}
                    onChange={handleFilterChange}
                    sx={{ bgcolor: "white" }}
                />
            </Box>
        </Grid>

        {contextFilters.map((filter) => (
            <Grid size={{ xs: 12, md: 3 }} key={filter.key}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {filter.label}
                </Typography>
                <FormControl fullWidth size="small" sx={{ bgcolor: "white" }}>
                    <Select 
                        value={filters[filter.key]} 
                        name={filter.key} 
                        onChange={handleFilterChange}
                        displayEmpty
                    >
                        <MenuItem value="">Selecione</MenuItem>
                        {filter.options.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        ))}
      </Grid>

      {/* --- ÁREA DOS GRÁFICOS (DRAG & DROP) --- */}
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId={`droppable-${title}`} direction="horizontal">
            {(provided) => (
                <Box 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ 
                        display: "flex", 
                        overflowX: "auto", 
                        pb: 2, 
                        "&::-webkit-scrollbar": { height: 8 },
                        "&::-webkit-scrollbar-track": { backgroundColor: "#E5E7EB", borderRadius: 4 },
                        "&::-webkit-scrollbar-thumb": { backgroundColor: "#B0B8C4", borderRadius: 4 }
                    }}
                >
                    {charts.map((chart, index) => (
                        <Draggable key={chart.id} draggableId={chart.id} index={index}>
                            {(provided, snapshot) => (
                                <ChartCard 
                                    data={chart} 
                                    onZoom={(data) => setExpandedChart(data)} 
                                    provided={provided} 
                                    snapshot={snapshot}
                                    isReordering={isReordering}
                                />
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </Box>
            )}
        </Droppable>
      </DragDropContext>

      {/* --- MODAL DE ZOOM (AMPLIAÇÃO) --- */}
      <Dialog 
        open={!!expandedChart} 
        onClose={() => setExpandedChart(null)}
        maxWidth="lg"
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight="bold">{expandedChart?.title}</Typography>
            <IconButton onClick={() => setExpandedChart(null)}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
                        p: 4, 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center", 
                        overflow: "hidden"
                        }}>
            {expandedChart && (
                <Box sx={{ width: 800, height: 500 }}> 
                    {/* Condicional também no Zoom */}
                    {expandedChart.type === 'geomap' ? (
                        <PernambucoMap dataMap={expandedMapData} />
                    ) : (
                        <Chart 
                            options={{...expandedChart.options, chart: { ...expandedChart.options.chart, zoom: { enabled: true }}}} 
                           series={expandedChart.series} 
                    
                    type={getApexType(expandedChart.type)} 
                    height="100%"
                            width="100%"
                        />
                    )}
                </Box>
            )}
        </DialogContent>
      </Dialog>

     {/* --- MODAL DE GRADE (VISÃO DE RELATÓRIO) --- */}
      <Dialog 
        open={isGridModalOpen} 
        onClose={() => setIsGridModalOpen(false)}
        maxWidth="xl" 
        fullWidth
        PaperProps={{ sx: { bgcolor: "#F8FAFC", minHeight: "85vh", borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "white", borderBottom: "1px solid #E5E7EB", px: 3, py: 1.5 }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6" fontWeight="bold" color="#111827">
                    {title} - Visão Geral
                </Typography>
                <Chip 
                    label={chipConfig.label} 
                    size="small" 
                    sx={{ bgcolor: chipConfig.bgcolor, color: chipConfig.color, fontWeight: "bold", borderRadius: 1.5 }} 
                />
            </Box>
            <Box display="flex" gap={1}>
                {/* BOTÃO DE IMPRIMIR / PDF */}
                <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => window.print()} 
                    sx={{ borderColor: "#003380", color: "#003380", textTransform: "none", fontWeight: "bold" }}
                >
                    Imprimir / PDF
                </Button>
                <IconButton onClick={() => setIsGridModalOpen(false)} sx={{ color: "#6B7280" }}>
                    <CloseIcon />
                </IconButton>
            </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 2 }}> 
            <Grid container spacing={2}> 
                {charts.map((chart) => {
                    const mapDataForGrid = chart.type === 'geomap' ? transformDataForMap(chart) : {};
                    const gridOptions = {
                        ...chart.options,
                        chart: { 
                            ...chart.options?.chart, 
                            toolbar: { show: false } 
                        },
                        plotOptions: {
                            ...chart.options?.plotOptions,
                            bar: {
                                ...chart.options?.plotOptions?.bar,
                                customScale: 1 
                            }
                        }
                    };

                    return (
                        <Grid size={{ xs: 12, md: 6 }} key={chart.id}>
                            <Paper sx={{ 
                                p: 2, 
                                height: "38vh", 
                                
                                display: "flex", 
                                flexDirection: "column", 
                                borderRadius: 2, 
                                border: "1px solid #E5E7EB",
                                elevation: 0
                            }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1}>
                                    {chart.title}
                                </Typography>
                                
                                <Box flexGrow={1} sx={{ position: "relative", minHeight: 0 }}>
                                    {chart.type === 'geomap' ? (
                                        <Box sx={{ position: "absolute", inset: 0 }}>
                                            <PernambucoMap dataMap={mapDataForGrid} />
                                        </Box>
                                    ) : (
                                        <Box sx={{ position: "absolute", inset: 0 }}>
                                            <Chart 
                                                options={gridOptions} 
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
            </Grid>
        </DialogContent>
      </Dialog>

    </Paper>
  );
};

// --- PÁGINA PRINCIPAL ---

export default function DashboardPage() {
  const { getChartsByIndicator } = useDashboard();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: "#333" }}>
        Dashboard
      </Typography>

      {/* RENDERIZAÇÃO DINÂMICA DE TODOS OS INDICADORES */}
      {INDICATORS_DB.map((indicator, index) => {
        const indicatorCharts = getChartsByIndicator(indicator.id);
        const municipioAttr = indicator.calculationAttributes.find(a => a.id === 'municipio');
        const contextAttributes = indicator.contextAttributes.filter(attr => attr.id !== 'data' && attr.id !== 'ano');
        const combinedAttributes = municipioAttr ? [municipioAttr, ...contextAttributes] : contextAttributes;
        const dynamicFilters = combinedAttributes.map(attr => ({
            label: attr.label,
            key: attr.id,
            options: getAttributeValues(attr.id)
        }));

        return (
            <Box key={indicator.id}>
                <IndicatorRow 
                    title={indicator.label} 
                    contextFilters={dynamicFilters}
                    initialCharts={indicatorCharts}
                    indicatorId={indicator.id} 
                    type={indicator.type}
                    multiplier={indicator.multiplier}
                />
                
                {index < INDICATORS_DB.length - 1 && (
                    <Box sx={{ height: 4, bgcolor: "#E5E7EB", my: 4, borderRadius: 2 }} />
                )}
            </Box>
        );
      })}

      {/* --- RODAPÉ --- */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mt={6} 
        pt={2} 
        borderTop="1px solid #E5E7EB"
      >
        <Typography variant="caption" color="text.secondary">
            Última atualização em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
        </Typography>

        <Box display="flex" gap={2}>
            <Button 
                variant="outlined" 
                sx={{ 
                    textTransform: "none", 
                    fontWeight: "bold",
                    color: "#1E3A8A",
                    borderColor: "#1E3A8A",
                    px: 3
                }}
            >
                Enviar arquivo
            </Button>
            <Button 
                variant="contained" 
                sx={{ 
                    textTransform: "none", 
                    fontWeight: "bold",
                    bgcolor: "#003380",
                    px: 3,
                    "&:hover": { bgcolor: "#002171" }
                }}
            >
                Gerar relatório
            </Button>
        </Box>
      </Box>

    </Container>
  );
}