"use client";

import { 
  Box, Typography, Grid, Paper, MenuItem, 
  Select, Divider, Alert, Stack, Chip 
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useMemo } from "react";
import { getIndicatorConfig, IndicatorAttribute } from "@/data/indicatorsConfig";

interface Step4MapColumnsProps {
  mappings: Record<string, { excelColumn: string; status: string }>; 
  setMappings: (newMappings: any) => void;
  fileColumns: string[]; 
  indicatorId: string;   
}

export default function Step4MapColumns({ 
  mappings, 
  setMappings, 
  fileColumns, 
  indicatorId 
}: Step4MapColumnsProps) {

  // 1. Carrega a configuração do indicador
  const indicatorConfig = useMemo(() => {
    return getIndicatorConfig(indicatorId);
  }, [indicatorId]);

  // 2. Inicializa o mapeamento
  useEffect(() => {
    if (!indicatorConfig) return;

    const initialMap: any = {};
    const allAttributes = [
        ...indicatorConfig.calculationAttributes, 
        ...indicatorConfig.contextAttributes
    ];

    allAttributes.forEach(attr => {
        const match = fileColumns.find(col => col.toLowerCase() === attr.label.toLowerCase());
        
        if (!mappings[attr.id]) {
            initialMap[attr.id] = {
                excelColumn: match || "", 
                status: match ? "confirmed" : "pending"
            };
        }
    });

    if (Object.keys(initialMap).length > 0) {
        setMappings((prev: any) => ({ ...prev, ...initialMap }));
    }
  }, [indicatorConfig, fileColumns]); 

  const handleMappingChange = (systemAttrId: string, selectedExcelColumn: string) => {
    setMappings((prev: any) => ({
        ...prev,
        [systemAttrId]: {
            excelColumn: selectedExcelColumn,
            status: "confirmed"
        }
    }));
  };

  const usedExcelColumns = useMemo(() => {
    const used = new Set<string>();
    Object.values(mappings).forEach((map) => {
        if (map && map.excelColumn) used.add(map.excelColumn);
    });
    return used;
  }, [mappings]);

  if (!indicatorConfig) return <Alert severity="error">Erro: Indicador não encontrado.</Alert>;

  const MappingRow = ({ attribute }: { attribute: IndicatorAttribute }) => {
    const currentMapping = mappings[attribute.id]?.excelColumn || "";
    const isMapped = !!currentMapping;

    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                p: 2, 
                bgcolor: isMapped ? "#F0FDF4" : "white", 
                borderColor: isMapped ? "success.light" : "divider",
                transition: "all 0.3s" 
            }}
        >
            <Grid container spacing={2} alignItems="center">
                
                <Grid size={{ xs: 12, md: 5 }}>
                    <Box display="flex" flexDirection="column">
                        <Typography variant="subtitle2" fontWeight="bold">
                            {attribute.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Campo obrigatório do sistema
                        </Typography>
                    </Box>
                </Grid>

                <Grid size ={{md: 1}} display="flex" justifyContent="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <ArrowForwardIcon color="action" />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Select
                        fullWidth
                        size="small"
                        displayEmpty
                        value={currentMapping}
                        onChange={(e) => handleMappingChange(attribute.id, e.target.value)}
                        renderValue={(selected) => {
                            if (!selected) {
                                return <Typography color="text.secondary">Selecione a coluna da planilha</Typography>;
                            }
                            return selected;
                        }}
                        sx={{ bgcolor: "white" }}
                    >
                        {fileColumns.map((col) => {
                            const isUsedElsewhere = usedExcelColumns.has(col) && col !== currentMapping;
                            
                            return (
                                <MenuItem key={col} value={col} disabled={isUsedElsewhere}>
                                    {col} {isUsedElsewhere && "(Já selecionada)"}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    
                    {isMapped && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                            <Typography variant="caption" color="success.main" fontWeight="bold">
                                Mapeado com sucesso
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h6" fontWeight="bold">Relacionar colunas</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Para importar dados para o indicador <strong>{indicatorConfig.label}</strong>, identifique quais colunas da planilha correspondem aos campos abaixo.
        </Typography>

        {indicatorConfig.type === 'RATE' && (
            <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 2 }}>
                Este é um indicador de <strong>TAXA (por {indicatorConfig.multiplier?.toLocaleString()})</strong>. 
                O sistema usará a coluna mapeada como <strong>Município</strong> para buscar a população no banco.
            </Alert>
        )}
      </Box>

      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Chip label="1" size="small" color="primary" sx={{ fontWeight: 'bold' }} />
            <Typography variant="subtitle1" fontWeight="bold">Variáveis para cálculo</Typography>
        </Stack>
        <Stack spacing={2}>
            {indicatorConfig.calculationAttributes.map(attr => (
                <MappingRow key={attr.id} attribute={attr} />
            ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Chip label="2" size="small" color="primary" sx={{ fontWeight: 'bold' }} />
            <Typography variant="subtitle1" fontWeight="bold">Variáveis de contexto</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
            Esses campos não afetam o cálculo, mas são essenciais para filtros.
        </Typography>
        <Stack spacing={2}>
            {indicatorConfig.contextAttributes.map(attr => (
                <MappingRow key={attr.id} attribute={attr} />
            ))}
        </Stack>
      </Box>

    </Box>
  );
}