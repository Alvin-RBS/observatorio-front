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
  TextField,
  CircularProgress
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import SearchIcon from "@mui/icons-material/Search";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import MapIcon from "@mui/icons-material/Map";
import { useRouter } from "next/navigation";
import { INDICATORS_DB } from "@/data/indicatorsConfig";
import { getAttributeValues } from "@/data/domainValues";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { useDashboard, ChartConfig } from "@/context/DashboardContext";
import SearchOffIcon from '@mui/icons-material/SearchOff';



import {
  getAggregatedData, transformToApexXYSeries, transformToApexPieSeries, transformToApexMatrixSeries, transformToGeomapSeries, DashboardRequestDTO
} from "@/features/dashBoard/services/dashboardService";


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
  isReordering,
  isFiltering
}: {
  data: ChartConfig,
  onZoom: (data: ChartConfig) => void,
  provided: any
  snapshot: DraggableStateSnapshot
  isReordering: boolean
  isFiltering: boolean
}) => {
 
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
                <PernambucoMap dataMap={data.series as unknown as Record<string, number>} />
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
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasDateChanged, setHasDateChanged] = useState(false);


  useMemo(() => {
    setCharts(initialCharts);
  }, [initialCharts]);


  const [filters, setFilters] = useState<Record<string, string>>({
    inicio: "2025-01-01",
    fim: new Date().toISOString().split('T')[0], ...contextFilters.reduce((acc, curr) => ({ ...acc, [curr.key]: "" }), {})});


  const handleFilterChange = (e: any) =>{ if (e.target.name === 'inicio' || e.target.name === 'fim') {
          setHasDateChanged(true);
      }
      
      setFilters({ ...filters, [e.target.name]: e.target.value });
  };


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
        setIsLoading(true);
          setIsFiltering(true);
          try {
              // 1. Separa o filtro de Data dos filtros normais (exatos)
              const { inicio, fim, ...exactFilters } = filters;


              const cleanFilters: Record<string, string> = {};
              Object.keys(exactFilters).forEach(key => {
                  if (exactFilters[key] !== "") {
                      cleanFilters[key] = exactFilters[key];
                  }
              });


              // 2. Dispara requisições em paralelo para cada gráfico do indicador
              const updatedCharts = await Promise.all(initialCharts.map(async (chartTemplate) => {
                 
                // Adicionamos a checagem de tamanho para o metrics também
                if (!chartTemplate.groupBy || !chartTemplate.groupBy.length || !chartTemplate.metrics || !chartTemplate.metrics.length) {
                return chartTemplate;
}
                const mergedFilters: Record<string, string> = { ...chartTemplate.chartFilters };

                  if (cleanFilters) {
                      Object.keys(cleanFilters).forEach(key => {
                          if (mergedFilters[key]) {
                              // Se TANTO o gráfico QUANTO o global têm filtro para essa coluna, achamos a interseção!
                              const chartVals = mergedFilters[key].split(",").map(v => v.trim().toUpperCase());
                              const globalVals = cleanFilters[key].split(",").map(v => v.trim().toUpperCase());
                              
                              const intersection = chartVals.filter(v => globalVals.includes(v));
                              
                              // Se não sobrou nada em comum, mandamos um código secreto pro Mock não renderizar nada
                              mergedFilters[key] = intersection.length > 0 ? intersection.join(",") : "__NONE__";
                          } else {
                              // Se o gráfico não tinha restrição para essa coluna, o filtro global manda
                              mergedFilters[key] = cleanFilters[key];
                          }
                      });
                  }

                   // RAIO-X PARA DEBUGGAR:
                  console.log("🔥 Gráfico:", chartTemplate.title);
                  console.log("👉 GroupBy esperado:", chartTemplate.groupBy);
                  console.log("👉 Filtros chegando:", mergedFilters);
                  const payload: DashboardRequestDTO = {
                      indicatorId: indicatorId,
                      filters: mergedFilters,
                      ...(hasDateChanged && {
                          rangeFilter: {
                              attributeId: "data",
                              startValue: filters.inicio,
                              endValue: filters.fim
                          }
                      }),
                      groupBy: chartTemplate.groupBy,
                      metrics: chartTemplate.metrics
                  };


                  try {
                      // Bate no Java!
                      const rawData = await getAggregatedData(payload);
                     
                      let newSeries: any = [];
                      const newOptions = { ...chartTemplate.options };


                      // 3. Aplica o Adaptador correto baseado no tipo do gráfico
                      if (chartTemplate.type === 'geomap') {
                          newSeries = transformToGeomapSeries(rawData, chartTemplate.groupBy[0]);
                      }
                      else if (['pie', 'donut'].includes(chartTemplate.type)) {
                          const adapted = transformToApexPieSeries(rawData, chartTemplate.groupBy[0]);
                          newSeries = adapted.series;
                          newOptions.labels = adapted.labels;
                      }
                      else if (['heatmap', 'treemap'].includes(chartTemplate.type)) {
                          const adapted = transformToApexMatrixSeries(rawData, chartTemplate.groupBy[0], chartTemplate.groupBy[1]);
                          newSeries = adapted.series;
                      }
                      else {
                          // Familia X/Y (line, bar, area, bar-horizontal)
                          const adapted = transformToApexXYSeries(rawData, chartTemplate.groupBy[0], chartTemplate.groupBy[1]);
                          newSeries = adapted.series;
                          newOptions.xaxis = { ...newOptions.xaxis, categories: adapted.categories };
                      }


                      return {
                          ...chartTemplate,
                          series: newSeries,
                          options: newOptions
                      };


                  } catch (err) {
                      console.error(`Erro ao carregar dados do gráfico ${chartTemplate.title}:`, err);
                      // Se falhar a request deste gráfico, retorna ele vazio/original para não quebrar a tela toda
                      return chartTemplate;
                  }
              }));


              setCharts(updatedCharts);


          } catch (error) {
              console.error(`Erro geral ao buscar dados para o indicador ${indicatorId}:`, error);
          } finally {
           
              setIsFiltering(false);
               setIsLoading(false);
          }
      };


      if (indicatorId && initialCharts.length > 0) {
          loadFilteredData();
      }
  }, [filters, indicatorId, initialCharts]);
 


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
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Período de visualização
            </Typography>
            <Box display="flex" gap={2}>
                {/* CALENDÁRIO INICIAL DINÂMICO */}
                <TextField
                    type="date"
                    fullWidth
                    size="small"
                    name="inicio"
                    value={filters.inicio}
                    onChange={handleFilterChange}
                    sx={{
                        bgcolor: "white",
                        "& input": { cursor: "pointer" } // Deixa a setinha do mouse como "mãozinha"
                    }}
                    inputProps={{
                        // Força a abertura do calendário ao clicar em qualquer lugar do campo
                        onClick: (e: any) => {
                            try {
                                e.target.showPicker();
                            } catch (error) {
                                // Fallback silencioso para navegadores muito antigos
                            }
                        }
                    }}
                />
               
                {/* CALENDÁRIO FINAL DINÂMICO */}
                <TextField
                    type="date"
                    fullWidth
                    size="small"
                    name="fim"
                    value={filters.fim}
                    onChange={handleFilterChange}
                    sx={{
                        bgcolor: "white",
                        "& input": { cursor: "pointer" }
                    }}
                    inputProps={{
                        onClick: (e: any) => {
                            try {
                                e.target.showPicker();
                            } catch (error) {}
                        }
                    }}
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
                    {charts.map((chart, index) => {
                        
                        // 1. Verificação se os dados deste gráfico específico foram "zerados" pelos filtros
                        const isChartEmpty = 
                            !chart.series || 
                            chart.series.length === 0 || 
                            (Array.isArray(chart.series[0]?.data) && chart.series[0].data.length === 0);

                        return (
                          <Draggable key={chart.id} draggableId={chart.id} index={index}>
                                {(provided, snapshot) => {
                                    
                                    // 1. ESTADO DE CARREGAMENTO (Tem prioridade máxima)
                                    if (isLoading) {
                                        return (
                                            <Box
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                sx={{
                                                    minWidth: 400,
                                                    height: 380,
                                                    marginRight: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: "#F9FAFB",
                                                    border: "1px solid #E5E7EB", // Borda mais sutil pro loading
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <CircularProgress size={40} sx={{ color: '#3362A0' }} />
                                                 <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                                    Carregando...
                                                </Typography>
                                            </Box>
                                        );
                                    }

                                    // 2. ESTADO VAZIO (Só aparece se NÃO estiver carregando e os dados forem nulos)
                                    if (isChartEmpty) {
                                        return (
                                            <Box
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                sx={{
                                                    minWidth: 400,
                                                    height: 380,
                                                    marginRight: 2,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: "#F9FAFB",
                                                    border: "2px dashed #D1D5DB",
                                                    borderRadius: 2,
                                                    position: "relative",
                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                }}
                                            >
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ position: 'absolute', top: 16, left: 16 }}>
                                                    {chart.title || "Gráfico"}
                                                </Typography>
                                                <SearchOffIcon sx={{ fontSize: 48, mb: 1, color: '#9CA3AF' }} />
                                                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                                    Nenhum dado encontrado.
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" textAlign="center" mt={0.5}>
                                                    Filtros incompatíveis para este escopo.
                                                </Typography>
                                            </Box>
                                        );
                                    }

                                    // 3. ESTADO DE SUCESSO (O Card Real com os gráficos)
                                    return (
                                        <ChartCard
                                            data={chart}
                                            onZoom={(data) => setExpandedChart(data)}
                                            provided={provided}
                                            snapshot={snapshot}
                                            isReordering={isReordering}
                                            isFiltering={isFiltering}
                                        />
                                    );
                                }}
                            </Draggable>
                        );
                    })}
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
                        <PernambucoMap dataMap={expandedChart.series as unknown as Record<string, number>} />
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
        PaperProps={{ 
            sx: { 
                bgcolor: "#F8FAFC", 
                minHeight: "85vh", 
                borderRadius: 3,
                // CORREÇÃO 1: Tira o fundo cinza, remove limite de altura e permite que o conteúdo "vaze" para o PDF
                "@media print": {
                    bgcolor: "white",
                    minHeight: "auto",
                    boxShadow: "none",
                    overflow: "visible",
                }
            } 
        }}
        sx={{
            // CORREÇÃO 2: Esconde a máscara escura de fundo do Modal na hora de imprimir
            "@media print": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                "& .MuiBackdrop-root": { display: "none" }
            }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "white", borderBottom: "1px solid #E5E7EB", px: 3, py: 1.5, "@media print": { borderBottom: "none", px: 0 } }}>
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
            
            {/* CORREÇÃO 3: Esconde a área de botões na hora de imprimir (não faz sentido botões no PDF) */}
            <Box display="flex" gap={1} sx={{ "@media print": { display: "none" } }}>
               {/* <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.print()}
                    sx={{ borderColor: "#003380", color: "#003380", textTransform: "none", fontWeight: "bold" }}
                >
                    Imprimir / PDF
                </Button>*/}
                <IconButton onClick={() => setIsGridModalOpen(false)} sx={{ color: "#6B7280" }}>
                    <CloseIcon />
                </IconButton>
            </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 2, "@media print": { p: 0, overflow: "visible" } }}>
            <Grid container spacing={2}>
                {charts.map((chart) => {
                    const gridOptions = {
                        ...chart.options,
                        chart: {
                            ...chart.options?.chart,
                            toolbar: { show: false },
                            // CORREÇÃO 4: Desativa animações na hora de imprimir para garantir que o Apex renderize o final imediatamente
                            animations: { enabled: false } 
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
                        <Grid 
                            size={{ xs: 12, md: 6 }} 
                            key={chart.id}
                            // CORREÇÃO 5: Força a grade a ter 50% de largura na impressão (2 por linha garantidos)
                            sx={{ "@media print": { width: "50%", flexBasis: "50%", maxWidth: "50%" } }}
                        >
                            <Paper sx={{
                                p: 2,
                                height: "38vh", // Mantém vh apenas para a tela
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 2,
                                border: "1px solid #E5E7EB",
                                elevation: 0,
                                // CORREÇÃO 6: Trava a altura em pixels na impressão e impede quebra de página no meio do gráfico
                                "@media print": {
                                    height: "400px", 
                                    pageBreakInside: "avoid",
                                    breakInside: "avoid",
                                    border: "1px solid #E5E7EB"
                                }
                            }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1}>
                                    {chart.title}
                                </Typography>
                                
                                <Box flexGrow={1} sx={{ position: "relative", minHeight: 0 }}>
                                    {chart.type === 'geomap' ? (
                                        <Box sx={{ position: "absolute", inset: 0 }}>
                                            <PernambucoMap dataMap={chart.series as unknown as Record<string, number>} />
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