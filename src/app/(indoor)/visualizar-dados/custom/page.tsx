"use client";

import { useState, useEffect, Suspense } from "react";
import { Box, Typography, Container, Button, FormControl, Select, MenuItem, Chip } from "@mui/material";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboard, ChartConfig, ChartType } from "@/context/DashboardContext"; 
import { ChartRow } from "@/features/dashBoard/components/ChartRow"; // Importado
import { ChartCreationModal } from "@/features/dashBoard/components/ChartCreator/ChartCreationModal"; // Importado
import { INDICATORS_DB } from "@/data/indicatorsConfig";

// 1. Renomeamos sua função principal para ser o "Miolo" da página
function CustomizarDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getChartsByIndicator, updateIndicatorCharts } = useDashboard();

  // 2. Tenta pegar o ID da URL. Se não tiver (ex: usuário acessou direto pelo menu), usa o 1º da lista.
  const urlIndicatorId = searchParams.get("indicatorId");
  const initialId = urlIndicatorId && INDICATORS_DB.some(i => i.id === urlIndicatorId) 
        ? urlIndicatorId 
        : INDICATORS_DB[0].id;

  // O estado inicial agora respeita o que veio da URL
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(initialId);

  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentIndicator = INDICATORS_DB.find(i => i.id === selectedIndicatorId);

  const getChipConfig = () => {
      if (currentIndicator?.type === 'ABSOLUTE') {
          return { label: 'Número Absoluto', bgcolor: '#fcfee0', color: '#c7b602' }; // Azul suave
      }
      
      const kValue = currentIndicator?.multiplier && currentIndicator.multiplier >= 1000 ? `${currentIndicator.multiplier / 1000} mil` : currentIndicator?.multiplier;
      return { 
          label: `Taxa/${kValue}`, 
          bgcolor: '#E6EDF5', 
          color: '#003380' // 
      };
  };

  const chipConfig = getChipConfig();

  useEffect(() => {
    const data = getChartsByIndicator(selectedIndicatorId);
    setCharts(data);
  }, [selectedIndicatorId, getChartsByIndicator]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(charts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCharts(items);
  };

  const handleSaveItem = (id: string, newTitle: string, newType: string) => {
    setCharts((prev) => 
      prev.map(item => item.id === id ? { ...item, title: newTitle, type: newType as ChartType } : item)
    );
  };

  const handleDeleteItem = (id: string) => {
    setCharts((prev) => prev.filter(item => item.id !== id));
  };

  const handleCreateChart = (newChart: ChartConfig) => {
    setCharts([...charts, newChart]);
  };

  const handleFinalize = () => {
    // Salva usando o ID correto
    updateIndicatorCharts(selectedIndicatorId, charts);
    router.push("/visualizar-dados");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={5}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#111827", mb: 3 }}>
          Customizar dados
        </Typography>
        
       <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2" color="text.secondary">Selecione qual indicador deseja customizar:</Typography>
            
            {/* O NOVO BOX FLEX PARA ALINHAR O SELECT E O CHIP */}
            <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 300, maxWidth: 400, bgcolor: "white" }}>
                    <Select 
                        value={selectedIndicatorId} 
                        onChange={(e) => setSelectedIndicatorId(e.target.value)}
                        sx={{ borderRadius: 1 }}
                    >
                        {INDICATORS_DB.map((indicator) => (
                            <MenuItem key={indicator.id} value={indicator.id}>
                                {indicator.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* RENDERIZAÇÃO DO CHIP DINÂMICO */}
                {chipConfig && (
                    <Chip 
                        label={chipConfig.label} 
                        size="small" 
                        sx={{ 
                            bgcolor: chipConfig.bgcolor, 
                            color: chipConfig.color, 
                            fontWeight: 600, 
                            fontSize: "0.7rem",
                            letterSpacing: "0.5px",
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'rgba(0, 51, 128, 0.15)'
                        }} 
                    />
                )}
            </Box>
        </Box>
      </Box>

      {/* CABEÇALHO E LISTA (Mantido igual) */}
      {/* ... Grid Header ... */}
      
      <Box borderTop="1px solid #E5E7EB" mb={2} />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="charts-list">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {charts.map((chart, index) => (
                <ChartRow 
                  key={chart.id} 
                  item={chart} 
                  index={index} 
                  onSave={handleSaveItem}
                  onDelete={handleDeleteItem}
                />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Box display="flex" gap={2} mt={5}>
        <Button 
            variant="outlined" 
            onClick={() => setIsModalOpen(true)}
            sx={{ textTransform: "none", borderColor: "#003380", color: "#003380", fontWeight: "bold", px: 4 }}
        >
            Adicionar gráfico
        </Button>
        <Button 
            variant="contained" 
            onClick={handleFinalize}
            sx={{ textTransform: "none", bgcolor: "#003380", fontWeight: "bold", px: 6 }}
        >
            Finalizar
        </Button>
      </Box>

      <ChartCreationModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleCreateChart}
        indicatorId={selectedIndicatorId}
      />

    </Container>
  );
}
    // 3. Este passa a ser o componente exportado oficialmente, protegendo o uso do searchParams
export default function CustomizarDashboardPage() {
    return (
        <Suspense fallback={<Typography sx={{ p: 4 }}>Carregando customização...</Typography>}>
            <CustomizarDashboardContent />
        </Suspense>
    );
   }