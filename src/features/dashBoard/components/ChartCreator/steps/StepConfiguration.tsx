import { useMemo, useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText, 
  TextField, 
  Paper,
  FormHelperText,
  Grid,
  Button,
  Divider,
  Chip
} from "@mui/material";
import { ChartDraft } from "../../../hooks/useChartCreation"; 
import { getIndicatorConfig } from "@/data/indicatorsConfig";
import { getAttributeValues } from "@/data/domainValues";

interface Props {
  draft: ChartDraft;
  onChangeConfig: (updates: Partial<ChartDraft['config']>) => void;
  indicatorId: string;
}

export const StepConfiguration = ({ draft, onChangeConfig, indicatorId }: Props) => {
  const indicator = getIndicatorConfig(indicatorId);
  const chartType = draft.type;

  // Estado local para busca nos checkboxes PRINCIPAIS
  const [searchTerm, setSearchTerm] = useState("");
  // Estado local para busca nos checkboxes SECUNDÁRIOS
  const [subSearchTerm, setSubSearchTerm] = useState("");

  const availableDimensions = useMemo(() => {
    if (!indicator) return [];

    // AGORA ACEITA TEXTO E NÚMERO (Traz 'idade' de volta!)
    const validAttrs = indicator.contextAttributes.filter(a => a.dataType === 'text' || a.dataType === 'number');
    
    // Procura se tem município em algum lugar
    const hasMunicipio = [...indicator.calculationAttributes, ...indicator.contextAttributes].find(a => a.id === 'municipio');

    if (hasMunicipio && !validAttrs.find(a => a.id === 'municipio')) {
      return [hasMunicipio, ...validAttrs];
    }
    
    return validAttrs;
  }, [indicator, chartType]);

  // --- 1.1 LÓGICA DE SUB-ATRIBUTOS (Exclui o que já foi selecionado no principal) ---
  const availableSubDimensions = useMemo(() => {
    if (!draft.config.xAxisAttribute) return [];
    return availableDimensions.filter(attr => attr.id !== draft.config.xAxisAttribute);
  }, [availableDimensions, draft.config.xAxisAttribute]);


  // --- 2. CARREGAMENTO DE VALORES (DOMAIN) ---
  
  // Valores do Eixo Principal
  const domainValues = useMemo(() => {
    if (!draft.config.xAxisAttribute) return [];
    let values = getAttributeValues(draft.config.xAxisAttribute);
    if (searchTerm) {
      values = values.filter(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return values;
  }, [draft.config.xAxisAttribute, searchTerm]);

  // Valores da Sub-divisão
  const subDomainValues = useMemo(() => {
    if (!draft.config.secondaryAttribute) return [];
    let values = getAttributeValues(draft.config.secondaryAttribute);
    if (subSearchTerm) {
      values = values.filter(v => v.toLowerCase().includes(subSearchTerm.toLowerCase()));
    }
    return values;
  }, [draft.config.secondaryAttribute, subSearchTerm]);


  // --- HANDLERS PRINCIPAIS ---

  const handleAttributeChange = (attrId: string) => {
    onChangeConfig({ 
      xAxisAttribute: attrId, 
      selectedValues: [],
      // Se mudar o principal, reseta o secundário para evitar conflitos
      secondaryAttribute: undefined,
      secondaryValues: []
    });
    setSearchTerm("");
  };

  const handleValueToggle = (value: string) => {
    const current = draft.config.selectedValues || [];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChangeConfig({ selectedValues: newValues });
  };

  const handleSelectAll = () => {
    onChangeConfig({ selectedValues: domainValues });
  };

  // --- HANDLERS SECUNDÁRIOS ---

  const handleSecondaryAttributeChange = (attrId: string) => {
    onChangeConfig({ 
      secondaryAttribute: attrId, 
      secondaryValues: [] 
    });
    setSubSearchTerm("");
  };

  const handleSecondaryValueToggle = (value: string) => {
    const current = draft.config.secondaryValues || [];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChangeConfig({ secondaryValues: newValues });
  };

  const handleSecondarySelectAll = () => {
    onChangeConfig({ secondaryValues: subDomainValues });
  };


  // --- RENDERIZAÇÃO ---

  if (!indicator) return <Typography color="error">Erro: Indicador não encontrado.</Typography>;

  // A. GRÁFICOS DE LINHA / ÁREA
  if (chartType === 'line' || chartType === 'area') {

    const validYears = getAttributeValues("ano").map(Number).sort();
    const minYear = validYears[0] || 2018;
    const maxYear = validYears[validYears.length - 1] || new Date().getFullYear();

    return (
      <Box display="flex" flexDirection="column" gap={3} >
        <Typography variant="body2" color="text.secondary">
            Defina o intervalo de tempo para análise da evolução.
        </Typography>
        <Grid container spacing={2}>
            <Grid size={{ xs: 6}}>
            <TextField 
                label="Ano Inicial" 
                type="number" 
                fullWidth 
                size="small"
                value={draft.config.startYear || 2019}
                onChange={(e) => onChangeConfig({ startYear: Number(e.target.value) })}
                inputProps={{ min: minYear, max: maxYear }}
            />
            </Grid>
            <Grid size={{ xs: 6}} >
            <TextField 
                label="Ano Final" 
                type="number" 
                fullWidth 
                size="small"
                value={draft.config.endYear || 2025}
                onChange={(e) => onChangeConfig({ endYear: Number(e.target.value) })}
                inputProps={{ min: minYear, max: maxYear }}
            />
            </Grid>
        </Grid>
        {chartType === 'line' && (
            <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                (Opcional) Deseja dividir a linha em sub-grupos?
            </Typography>
            <FormControl fullWidth size="small">
                <InputLabel> Dividir por...  </InputLabel>
                <Select
                value={draft.config.xAxisAttribute || ""}
                label="Dividir por..."
                onChange={(e) => handleAttributeChange(e.target.value)}
                >
               <MenuItem value=""><em>Nenhum (Linha única)</em></MenuItem>
                  {availableDimensions
                      .filter((attr) => attr.id !== 'ano') 
                      .map((attr) => (
                      <MenuItem key={attr.id} value={attr.id}>{attr.label}</MenuItem>
                  ))}
                </Select>
            </FormControl>
            {draft.config.xAxisAttribute && 
                renderCheckboxes(
                    domainValues, 
                    draft.config.selectedValues || [], 
                    handleValueToggle, 
                    searchTerm, 
                    setSearchTerm,
                    handleSelectAll
                )
            }
            </>
        )}
      </Box>
    );
  }

// B. MAPA GEOGRÁFICO
  if (chartType === 'geomap') {
    if (draft.config.xAxisAttribute !== 'municipio') {
       setTimeout(() => handleAttributeChange('municipio'), 0);
    }
    // Verifica se todos os valores possíveis já estão selecionados
    const isAllSelected = domainValues.length > 0 && draft.config.selectedValues?.length === domainValues.length;
    return (
      <Box display="flex" flexDirection="column" >
        <Typography variant="caption" color="text.secondary" fontSize="0.9rem">
          Este gráfico exibirá os dados agrupados por <strong>Município</strong>
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={1} >
          <Typography variant="subtitle2">Filtrar por cidades (Opcional)</Typography>
          {domainValues.length > 0 && (
            <Button 
                size="small" 
                onClick={() => isAllSelected ? onChangeConfig({ selectedValues: [] }) : handleSelectAll()} 
                sx={{ fontSize: '0.7rem' }}
            >
                {isAllSelected ? "Desmarcar Todos" : "Selecionar Todos"}
            </Button>
          )}
        </Box>
        {renderCheckboxes(
            domainValues, 
            draft.config.selectedValues || [], 
            handleValueToggle, 
            searchTerm, 
            setSearchTerm
        )}
      </Box>
    );
  }

  // C. BAR / PIE / TREEMAP / HEATMAP / DONUT
  const isAllSelected = domainValues.length > 0 && draft.config.selectedValues?.length === domainValues.length;
 const isAllSelectedSecondary = subDomainValues.length > 0 && draft.config.secondaryValues?.length === subDomainValues.length;
  return (
    <Box display="flex" flexDirection="column" gap={3} >
      
      {/* 1. SELEÇÃO PRINCIPAL (COLUNAS) */}
      <Box>
          {chartType === 'heatmap' && (<>
          
          <Divider sx={{ my: 1 }}>
                <Chip label= "Colunas (Eixo X)" size="small"/>
            </Divider>
          </>)}
          <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ mb: 2 }}>
            {chartType === 'heatmap' 
                ? "Escolha as Colunas do Eixo X" 
                : chartType === 'bar-horizontal' ? "Escolha as barras do Eixo Y"
                : "Escolha quais categorias serão usadas para subdividir o gráfico."}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>{chartType === 'bar-horizontal' ? "Barras" 
                       : chartType === 'bar' || chartType === 'heatmap' ? "Colunas"
                       : "Categorias"}
            </InputLabel>
            <Select
                value={draft.config.xAxisAttribute || ""}
                label= {chartType === 'bar-horizontal' ? "Barras" 
                       : chartType === 'bar' || chartType === 'heatmap' ? "Colunas"
                       : "Categorias"}
                onChange={(e) => handleAttributeChange(e.target.value)}
              >
                {availableDimensions.map((attr) => (
                  <MenuItem key={attr.id} value={attr.id}>{attr.label}</MenuItem>
                ))}
            </Select>
          </FormControl>

          {draft.config.xAxisAttribute && (
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight="bold">Valores selecionados:</Typography>
                {domainValues.length > 5 && (
                   <Button size="small" onClick={() => isAllSelected ? onChangeConfig({ selectedValues: [] }) : handleSelectAll()} sx={{ fontSize: '0.7rem' }}>
                     {isAllSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                    </Button>
                )}
              </Box>
              {renderCheckboxes(domainValues, draft.config.selectedValues || [], handleValueToggle, searchTerm, setSearchTerm)}
            </Box>//aqui
          )}
      </Box>

      {/* 2. SUB-DIVISÃO (LINHAS PARA HEATMAP / SÉRIES PARA BAR) */}
      {/* ATUALIZAÇÃO 2: Adicionado 'heatmap' na condição abaixo */}
      {(chartType === 'bar' || chartType === 'bar-horizontal' || chartType === 'heatmap') && draft.config.xAxisAttribute && (
        <>
            <Divider sx={{ my: 1 }}>
                <Chip label={chartType === 'heatmap' ? "Linhas (Eixo Y)" : "Opções Avançadas"} size="small" />
            </Divider>
            
            <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 2, border: '1px dashed #E5E7EB'}}>
                <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ mb: 2 }}>
                    {chartType === 'heatmap' ? "Escolha as linhas do Eixo Y" : "Sub-divisão"}
                </Typography>
                {(chartType === 'bar' || chartType === 'bar-horizontal') && 
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                     {chartType === 'bar' ? " (Opcional) Quebre cada coluna em sub-grupos" : "(Opcional) Quebre cada barra em sub-grupos"}
                </Typography>}

                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                    <InputLabel>{chartType === 'heatmap' ? "Linhas" : "Dividir por..."}</InputLabel>
                    <Select
                        value={draft.config.secondaryAttribute || ""}
                        label={chartType === 'heatmap' ? "Linhas" : "Dividir por..."}
                        onChange={(e) => handleSecondaryAttributeChange(e.target.value)}
                    >
                        <MenuItem value=""><em>Nenhum</em></MenuItem>
                        {availableSubDimensions.map((attr) => (
                            <MenuItem key={attr.id} value={attr.id}>{attr.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {draft.config.secondaryAttribute && (
                    <Box mt={2}>
                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" fontWeight="bold">Valores:</Typography>
                            {subDomainValues.length > 5 && (
                                <Button size="small" onClick={() => isAllSelectedSecondary ? onChangeConfig({ secondaryValues: [] }) : handleSecondarySelectAll()} sx={{ fontSize: '0.7rem' }}>
                                 {isAllSelectedSecondary ? "Desmarcar Todos" : "Selecionar Todos"}
                                </Button>
                            )}
                        </Box>
                        {renderCheckboxes(subDomainValues, draft.config.secondaryValues || [], handleSecondaryValueToggle, subSearchTerm, setSubSearchTerm)}
                    </Box>
                )}
            </Box>
        </>
      )}
    </Box>
  );
};

// --- SUB-COMPONENTE GENÉRICO DE CHECKBOXES ---
// Refatorado para não depender diretamente do draft, aceitando 'currentSelection'
const renderCheckboxes = (
    values: string[], 
    currentSelection: string[],
    onToggle: (v: string) => void,
    searchTerm: string,
    setSearchTerm: (s: string) => void,
    onSelectAll?: () => void
) => (
  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: "auto", p: 1 }}>
    {(values.length > 10 || searchTerm) && (
        <TextField 
            size="small" 
            placeholder="Buscar..." 
            fullWidth 
            sx={{ mb: 1, px: 1 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    )}

    {values.length === 0 ? (
        <Typography variant="caption" sx={{ p: 2, display: "block", textAlign: "center" }}>
            Nenhum valor encontrado.
        </Typography>
    ) : (
        values.map((value) => {
            const isChecked = currentSelection.includes(value);
            return (
                <MenuItem key={value} onClick={() => onToggle(value)} dense>
                    <Checkbox checked={isChecked} size="small" />
                    <ListItemText primary={value} />
                </MenuItem>
            );
        })
    )}
  </Paper>
);