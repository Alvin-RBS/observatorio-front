import { Box, Typography, TextField, Paper, Chip, Divider } from "@mui/material";
import { ChartDraft } from "../../../hooks/useChartCreation"; // Ajuste o caminho se necessário
import { getIndicatorConfig } from "@/data/indicatorsConfig";

interface Props {
  title: string;
  onChangeTitle: (t: string) => void;
  draft: ChartDraft;
  indicatorId: string;
}

// Dicionário para deixar o nome do gráfico mais legível na tela
const CHART_TYPE_LABELS: Record<string, string> = {
  'line': 'Linha',
  'area': 'Área',
  'bar': 'Colunas',
  'bar-horizontal': 'Barras ',
  'pie': 'Pizza',
  'donut': 'Donut',
  'geomap': 'Mapa Geográfico',
  'treemap': 'Treemap',
  'heatmap': 'Mapa de Calor',
};

export const StepDetails = ({ title, onChangeTitle, draft, indicatorId }: Props) => {
  // Busca as configurações do indicador para traduzir os IDs (ex: 'municipio' -> 'Município')
  const indicator = getIndicatorConfig(indicatorId);
  const allAttributes = [
      ...(indicator?.calculationAttributes || []), 
      ...(indicator?.contextAttributes || [])
  ];

  const getAttrLabel = (id?: string) => {
      if (!id) return "-";
      return allAttributes.find(a => a.id === id)?.label || id;
  };

  const chartName = draft.type ? CHART_TYPE_LABELS[draft.type] || draft.type : "Não definido";
  const primaryLabel = getAttrLabel(draft.config.xAxisAttribute);
  const secondaryLabel = draft.config.secondaryAttribute ? getAttrLabel(draft.config.secondaryAttribute) : null;
  const startYear = draft.config.startYear || "2019";
  const endYear = draft.config.endYear || "2025";
  const periodText = `${startYear} a ${endYear}`;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="body2" color="text.secondary">
        Dê um nome descritivo para o seu gráfico e revise as configurações.
      </Typography>

      <TextField 
        label="Título do Gráfico"
        fullWidth
        required
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
        placeholder="Ex: Evolução de Homicídios por Sexo"
        helperText="Este título aparecerá no cabeçalho do card."
        autoFocus // Já coloca o cursor para o usuário digitar
      />

      <Divider />

      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.primary">
            Resumo da Configuração
        </Typography>
        
        {/* CAIXA DE RESUMO ELEGANTE */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', borderColor: '#E2E8F0' }}>
            <Box display="flex" flexWrap="wrap" gap={3}>
                
                {/* 1. Tipo do Gráfico */}
                <Box flex="1 1 40%">
                    <Typography variant="caption" color="text.secondary" display="block">Tipo de Gráfico</Typography>
                    <Chip 
                        label={chartName} 
                       
                        size="small" 
                        sx={{  color:"#003380", mt: 0.5, fontWeight: 500, bgcolor: '#E6EDF5', border: '1px solid #003380' }} 
                    />
                </Box>

               {/* 2 e 3. Atributos baseados no tipo */}
                {draft.type === 'geomap' ? (
                    <Box flex="1 1 40%">
                        <Typography variant="caption" color="text.secondary" display="block">Agrupamento Base</Typography>
                        <Typography variant="body2" fontWeight={500} mt={0.5}>Município</Typography>
                    </Box>
                ) : draft.type === 'line' || draft.type === 'area' ? (
                    /* LÓGICA EXCLUSIVA PARA LINHA E ÁREA */
                    <>
                        <Box flex="1 1 40%">
                            <Typography variant="caption" color="text.secondary" display="block">Período de tempo</Typography>
                            <Typography variant="body2" fontWeight={500} mt={0.5}>{periodText}</Typography>
                        </Box>
                        {draft.config.xAxisAttribute && (
                            <Box flex="1 1 40%">
                                <Typography variant="caption" color="text.secondary" display="block">Séries (Linhas)</Typography>
                                <Typography variant="body2" fontWeight={500} mt={0.5}>{primaryLabel}</Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    /* LÓGICA PARA OS DEMAIS GRÁFICOS (Barra, Pizza, etc) */
                    <>
                        <Box flex="1 1 40%">
                            <Typography variant="caption" color="text.secondary" display="block">
                                {draft.type === 'heatmap' || draft.type === 'bar' ? 'Colunas (Eixo X)' 
                                : draft.type === 'bar-horizontal' ? 'Barras (Eixo Y)'
                                : 'Categoria principal'}
                            </Typography>
                            <Typography variant="body2" fontWeight={500} mt={0.5}>{primaryLabel}</Typography>
                        </Box>

                        {secondaryLabel && (
                            <Box flex="1 1 40%">
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {draft.type === 'heatmap' ? 'Linhas (Eixo Y)' : 'Sub-divisão'}
                                </Typography>
                                <Typography variant="body2" fontWeight={500} mt={0.5}>{secondaryLabel}</Typography>
                            </Box>
                        )}
                    </>
                )}
                
            </Box>
        </Paper>
      </Box>
    </Box>
  );
};