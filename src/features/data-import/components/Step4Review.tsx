"use client";

import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Alert, Grid, Stack, Divider, Chip, CircularProgress 
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import BarChartIcon from "@mui/icons-material/BarChart";
import SdStorageIcon from "@mui/icons-material/SdStorage";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useMemo, useEffect, useState } from "react";
import { getIndicatorById, IndicatorConfig } from "@/features/data-import/services/indicatorService";

interface Step5ReviewProps {
  file: File | null;
  indicatorId: string;
  mappings: Record<string, { excelColumn: string; status: string }>;
  fileColumns: string[]; 
  previewMatrix: any[][]; 
}

export default function Step5Review({ 
  file, 
  indicatorId, 
  mappings, 
  fileColumns, 
  previewMatrix 
}: Step5ReviewProps) {

  // 1. Estado para guardar a configuração que vem da AWS
  const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Busca a configuração do Java assim que a tela abre
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getIndicatorById(indicatorId);
        setIndicatorConfig(config);
      } catch (error) {
        console.error("Erro ao carregar a configuração do indicador no Step 5:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [indicatorId]);

  // 3. Lista unificada de colunas a exibir
  const columnsToShow = useMemo(() => {
    if (!indicatorConfig) return [];
    return [
        ...indicatorConfig.calculationAttributes,
        ...indicatorConfig.contextAttributes
    ];
  }, [indicatorConfig]);

  // 4. Formata o tamanho do arquivo
  const fileSize = useMemo(() => {
    if (!file) return "0 KB";
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(file.size) / Math.log(k));
    return parseFloat((file.size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, [file]);

  // 5. Transforma a matriz bruta do Excel
  const transformedData = useMemo(() => {
    if (!previewMatrix || previewMatrix.length <= 1 || !indicatorConfig) return [];

    const dataRows = previewMatrix.slice(1);

    return dataRows.map((row) => {
      const newRow: any = {};
      
      columnsToShow.forEach((attr) => {
        const mappedExcelColumn = mappings[attr.id]?.excelColumn;
        
        if (mappedExcelColumn) {
            const columnIndex = fileColumns.indexOf(mappedExcelColumn);
            if (columnIndex !== -1) {
                newRow[attr.id] = row[columnIndex];
            }
        }
      });
      return newRow;
    });
  }, [previewMatrix, fileColumns, mappings, indicatorConfig, columnsToShow]);

  // PROTEÇÃO CONTRA A TELA BRANCA: Mostra loading enquanto o Java não responde
  if (loading) {
      return (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography color="text.secondary">Montando prévia dos dados...</Typography>
          </Box>
      );
  }

  // Se der erro na rede e não carregar, avisa amigavelmente
  if (!indicatorConfig) {
      return <Alert severity="error">Erro ao carregar os detalhes do indicador para revisão.</Alert>;
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Revisar e finalizar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Confira como os dados serão estruturados no sistema. A tabela abaixo exibe apenas as colunas mapeadas.
        </Typography>
      </Box>

      {/* 1. CARDS DE RESUMO */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: "#F8FAFC", borderRadius: 2 }}>
        <Grid container spacing={3}>
            
            {/* Nome do Arquivo */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, bgcolor: "primary.light", borderRadius: 2, color: "primary.main", flexShrink: 0 }}>
                        <InsertDriveFileIcon />
                    </Box>
                    <Box sx={{ minWidth: 0 }}> 
                        <Typography variant="caption" color="text.secondary">Arquivo de origem</Typography>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap title={file?.name}>
                            {file?.name || "Sem arquivo"}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>

            {/* Indicador */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, bgcolor: "secondary.light", borderRadius: 2, color: "secondary.main", flexShrink: 0 }}>
                        <BarChartIcon />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary">Indicador destino</Typography>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap title={indicatorConfig.label}>
                            {indicatorConfig.label}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>

            {/* Tamanho do arquivo */}
            <Grid size={{ xs: 12, md: 3 }}>
                 <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, bgcolor: "success.light", borderRadius: 2, color: "success.dark", flexShrink: 0 }}>
                        <SdStorageIcon />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary">Tamanho</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main" noWrap>
                            {fileSize}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>
        </Grid>
      </Paper>
      
      <Divider sx={{ mb: 4 }} >
        <Chip label="Prévia dos dados estruturados" size="small" />
      </Divider>

      {/* 2. ALERTAS DE CONTEXTO */}
      <Stack spacing={2} mb={3}>
          <Alert 
            icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
            severity="success" 
            sx={{ bgcolor: "#F0FDF4", color: "#1B5E20" }}
          >
            Mapeamento concluído. O sistema identificou <strong>{columnsToShow.length} colunas</strong> do indicador.
          </Alert>

         {/*{indicatorConfig.type === 'RATE' && (
             <Alert severity="info" icon={<InfoOutlinedIcon />}>
                O indicador será salvo como <strong>TAXA</strong>. O cálculo será feito automaticamente multiplicando:
                <br/>
                <code>( {mappings['total_vitimas']?.excelColumn || mappings['total_feminicidios']?.excelColumn || "Total"} / População do Município ) * {indicatorConfig.multiplier?.toLocaleString()}</code>
             </Alert>
          )}*/}
      </Stack>

      {/* 3. TABELA DINÂMICA (Renderiza colunas baseadas no config) */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3, maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columnsToShow.map((col) => (
                <TableCell 
                    key={col.id} 
                    sx={{ bgcolor: "#E3F2FD", fontWeight: "bold", color: "#0D47A1", whiteSpace: 'nowrap' }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {transformedData.length > 0 ? transformedData.map((row: any, index: number) => (
              <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#F8FAFC' } }}>
                {columnsToShow.map((col) => (
                    <TableCell key={col.id} sx={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row[col.id] !== undefined ? String(row[col.id]) : "-"}
                    </TableCell>
                ))}
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={columnsToShow.length} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Não há dados visíveis na prévia. Verifique o mapeamento no passo anterior.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}