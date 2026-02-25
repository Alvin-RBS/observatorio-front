
import { Typography, Dialog, DialogContent, DialogTitle, Box, Button, DialogActions, Stepper, Step, StepLabel, Alert,    
         Collapse  } from "@mui/material";
import { useChartCreation, ChartDraft } from "../../hooks/useChartCreation";
import { StepTypeSelection } from "./steps/StepTypeSelection";
import { StepConfiguration } from "./steps/StepConfiguration";
import { StepDetails } from "./steps/StepDetails";
import { ChartConfig } from "@/context/DashboardContext";
import { getIndicatorConfig } from "@/data/indicatorsConfig";
import { getAttributeValues } from "@/data/domainValues";


interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (chart: ChartConfig) => void;
  indicatorId: string;
}


const STEPS = ["Tipo de Gráfico", "Configuração de Dados", "Detalhes"];




export const ChartCreationModal = ({ open, onClose, onSave, indicatorId }: Props) => {
  const { activeStep, draft, nextStep, prevStep, updateDraft, updateConfig, reset } = useChartCreation();


  const handleClose = () => {
    reset();
    onClose();
  };



  const handleFinish = () => {
    if (!draft.type) return;

    const generatedData = generateMockDataFromConfig(draft, indicatorId);

    // 2. MONTA O GROUP BY (Eixo X e Subdivisões)
    const groupByColumns: string[] = [];

    if (draft.type === 'line' || draft.type === 'area') {
        // Regra de Ouro: Em séries temporais, o eixo X é SEMPRE o tempo
        groupByColumns.push("ano");
        
        // A sub-divisão que o usuário escolheu (salva no xAxis) entra como segundo eixo
        if (draft.config.xAxisAttribute) {
            groupByColumns.push(draft.config.xAxisAttribute);
        }
    } else {
        // Lógica normal para os outros gráficos (Barras, Pizza, Heatmap, etc)
        if (draft.config.xAxisAttribute) {
            groupByColumns.push(draft.config.xAxisAttribute);
        }
        if (draft.config.yAxisAttribute) {
            groupByColumns.push(draft.config.yAxisAttribute);
        } else if (draft.config.secondaryAttribute) {
            groupByColumns.push(draft.config.secondaryAttribute);
        }
    }

    // ---> NOVIDADE: SALVANDO AS OPÇÕES MARCADAS COMO FILTRO <---
    const chartSpecificFilters: Record<string, string> = {};
    
    // 1. Filtro Principal (Ex: Eixo X da Pizza, Barras ou a Subdivisão da Linha)
    if (draft.config.xAxisAttribute && draft.config.selectedValues && draft.config.selectedValues.length > 0) {
        chartSpecificFilters[draft.config.xAxisAttribute] = draft.config.selectedValues.join(",");
    }

    // ---> A CORREÇÃO ENTRA AQUI! <---
    // 2. Filtro Secundário (Ex: Cidades marcadas no Eixo Y do Heatmap)
    if (draft.config.secondaryAttribute && draft.config.secondaryValues && draft.config.secondaryValues.length > 0) {
        chartSpecificFilters[draft.config.secondaryAttribute] = draft.config.secondaryValues.join(",");
    }

    // 3. Filtro de Anos para Gráficos de Linha e Área com VALIDAÇÃO
    if (draft.type === 'line' || draft.type === 'area') {
        const start = draft.config.startYear || 2019;
        const end = draft.config.endYear || 2025;
        
        // Puxa a lista de anos permitidos da nossa fonte da verdade
        const anosPermitidos = getAttributeValues("ano"); 
        const yearsArray: string[] = [];
        
        for (let y = start; y <= end; y++) {
            // SÓ ADICIONA NO FILTRO SE O ANO EXISTIR NO DOMAIN VALUES
            if (anosPermitidos.includes(y.toString())) {
                yearsArray.push(y.toString());
            }
        }
        
        // Previne que o gráfico quebre se ele colocar, por exemplo, 1990 a 1995 (tudo inválido)
        if (yearsArray.length > 0) {
            chartSpecificFilters["ano"] = yearsArray.join(",");
        }
    }

    const indicator = getIndicatorConfig(indicatorId);
    const metricColumn = indicator?.calculationAttributes?.[0]?.id || "total";

    const finalChart: ChartConfig = {
        id: Date.now().toString(),
        title: draft.title || "Novo Gráfico",
        type: draft.type,
        
        // Vai vazio! O useEffect da página encarrega de preencher usando o Mock
        series: [], 
        
        // Pegamos do template SÓ o visual limpo, sem erros do TypeScript
        options: generatedData.options, 
        
        groupBy: groupByColumns,
        metrics: [metricColumn],
        
        // ---> PASSA OS FILTROS CRUZADOS PARA O CONTEXTO AQUI <---
        chartFilters: chartSpecificFilters
    };

    onSave(finalChart);
    handleClose();
  };
 
 const getStep1ValidationMessage = () => {
    const type = draft.type;
    const primaryCount = draft.config.selectedValues?.length || 0;
   
    const hasSecondary = !!draft.config.secondaryAttribute;
    const secondaryCount = draft.config.secondaryValues?.length || 0;


    switch (type) {
        case 'pie':
        case 'donut':
            if (primaryCount < 2) return "Este gráfico precisa de pelo menos 2 categorias para ser válido.";
            if (primaryCount > 10) return `Este gráfico tem o limite de 10 categorias. Você selecionou ${primaryCount}.`;
            break;


        case 'bar':
        case 'bar-horizontal':
            if (primaryCount === 0) return `Selecione pelo menos uma categoria para este gráfico.`;
            if (primaryCount > 10) return `Este gráfico tem o limite de 10 categorias de coluna. Você selecionou ${primaryCount}.`;
            if (hasSecondary && secondaryCount > 5) {
                 return `Este gráfico tem o limite de 5 sub-divisões. Você selecionou ${secondaryCount}.`;
            }
            break;


    case 'line':
    case 'area': {
        // No gráfico de linha, as sub-divisões estão no selectedValues!
        const isDivided = !!draft.config.xAxisAttribute; 
        const lineSubCount = draft.config.selectedValues?.length || 0;

        if (isDivided && lineSubCount > 5) {
             return `Este gráfico tem o limite de 5 sub-divisões. Você selecionou ${lineSubCount}.`;
        }
        break;
    }
     
        case 'heatmap':
            if (primaryCount === 0) return `Selecione pelo menos uma coluna para este gráfico.`;
            if (primaryCount > 10) return `Este gráfico tem o limite de 10 colunas. Você selecionou ${primaryCount}.`;
            if (secondaryCount === 0) {
                return `Selecione pelo menos uma linha para este gráfico.`;
            }
            if (secondaryCount > 10) {
                 return `Este gráfico tem o limite de 10 linhas. Você selecionou ${secondaryCount}.`;
            }
            break;
           
        case 'treemap':
             if (primaryCount === 0) {
                return `Selecione pelo menos uma categoria para este gráfico.`;
            }
            if (primaryCount > 20) return `Este gráfico tem o limite de 20 categorias. Você selecionou ${primaryCount}.`;
            break;


        case 'geomap':
            if (primaryCount === 0) return "Selecione pelo menos um município.";
            break;
    }


    return null;
  };


  const step1Error = activeStep === 1 ? getStep1ValidationMessage() : null;


  return (
<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper" sx={{ height: 600 }}>
      <DialogTitle sx={{ fontWeight: "bold" }}>Adicionar Novo Gráfico</DialogTitle>
     
      <Box sx={{ px: 3, py: 2 }}>
        <Stepper activeStep={activeStep}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      </Box>


      <DialogContent dividers sx={{ minHeight: 200, p: 2 }}>
        {activeStep === 0 && (
            <StepTypeSelection
                selectedType={draft.type}
                onSelect={(type) => {
                    updateDraft({
                        type,
                        config: {}
                    });
                }}
            />
        )}
       
        {activeStep === 1 && (
            <StepConfiguration
                draft={draft}
                onChangeConfig={updateConfig}
                indicatorId={indicatorId}
            />
        )}


        {activeStep === 2 && (
            <StepDetails
                title={draft.title}
                onChangeTitle={(t) => updateDraft({ title: t })}
                draft={draft}              
                indicatorId={indicatorId}  
            />
        )}
      </DialogContent>


     {/* ALERTA VISUAL ANIMADO E ELEGANTE */}
      <Box sx={{ px: 3, pb: 1, minHeight: 68, display: 'flex', alignItems: 'flex-end' }}>
        <Box sx={{ width: '100%' }}>
          <Collapse in={activeStep === 1 && step1Error !== null}>
            <Alert
              severity="warning"
              variant="standard"
              sx={{
                  borderRadius: 2,
                  alignItems: 'center',
                  fontWeight: 500
              }}
            >
              {step1Error}
            </Alert>
          </Collapse>
        </Box>
      </Box>


      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined" color="primary">Cancelar</Button>
       
        <Box flexGrow={1} />
       
        {activeStep > 0 && (
            <Button onClick={prevStep}>Voltar</Button>
        )}
       
        {activeStep < STEPS.length - 1 ? (
            <Button
                variant="contained"
                onClick={nextStep}
                disabled={(activeStep === 0 && !draft.type) || (activeStep === 1 && step1Error !== null)}
            >
                Próximo
            </Button>
        ) : (
            <Button
                variant="contained"
                onClick={handleFinish}
                color="primary"
                disabled={!draft.title}
            >
                Criar Gráfico
            </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};


// ATUALIZAÇÃO: Agora a função recebe o indicatorId
export function generateMockDataFromConfig(draft: ChartDraft, indicatorId: string): { series: any[], options: any } {
    const { type, config } = draft;
   
    // 1. Busca as regras de negócio do indicador
    const indicator = getIndicatorConfig(indicatorId);
    const isRate = indicator?.type === 'RATE';
   
    // Label dinâmica para os tooltips (Taxa vs Ocorrências)
    const measureLabel = isRate ? " " : "ocorrências";


    const generateValue = () => {
        if (isRate) {
            // Se for Taxa, gera um número decimal (ex: 15.4, 42.1)
            return Number((Math.random() * 50 + 2).toFixed(1));
        }
        // Se for Absoluto, gera um número inteiro maior (ex: 120, 850)
        return Math.floor(Math.random() * 500) + 10;
    };
   
    // Labels do Eixo Principal (ex: Tipo de Arma ou Municípios)
    const labels = config.selectedValues && config.selectedValues.length > 0
        ? config.selectedValues
        : ["A", "B", "C"];


    const baseOptions = {
        chart: { toolbar: { show: false }, zoom: { enabled: false }, stacked: false },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 }
    };


    // 1. Geomap
    if (type === 'geomap') {
        const randomData = labels.map(() => generateValue());
        return {
            series: [{ name: "Ocorrências", data: randomData }],
            options: { ...baseOptions, xaxis: { categories: labels } }
        };
    }


    // 2. Line / Area (CORRIGIDO: Tooltip Compacto e Interatividade)
     if (type === 'line' || type === 'area') {
        const start = config.startYear || 2019;
        const end = config.endYear || 2025;
        const years = Array.from({length: (end - start) + 1}, (_, i) => start + i);
        if (config.xAxisAttribute && labels.length > 0) {
            return {
                series: labels.map(label => ({
                    name: label,
                    data: years.map(() => generateValue())
                })),
                options: {
                    ...baseOptions,
                    colors: [
    // As 5 cores originais e clássicas do ApexCharts (Garante o visual padrão)
    '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', 
    
    // Extensão com cores vibrantes para não repetir nas fatias/linhas extras
    '#3F51B5', // Índigo
    '#546E7A', // Azul acinzentado
    '#D4526E', // Rosa escuro
    '#8D5B4C', // Marrom
    '#F86624', // Laranja forte
    '#D7263D', // Carmim
    '#1B998B', // Verde água
    '#2E294E', // Roxo bem escuro
    '#F46036', // Coral
    '#E2C044', // Mostarda
    '#A300D6', // Violeta neon
    '#00D8B6', // Turquesa
    '#E91E63', // Pink
    '#9C27B0', // Púrpura
    '#00BCD4'  // Ciano
  ],
                    chart: {
                        ...baseOptions.chart,
                        toolbar: { show: false },
                        redrawOnParentResize: true,
                        
                    },
                    stroke: {
                            show: true,
                            // 'smooth' deixa a linha curva e suave. Se quiser retas, use 'straight'.
                            curve: 'straight', 
                            
                            // Define a espessura. O seu parece estar muito grosso (talvez 5 ou 6).
                            // Tente 2 ou 3 para um visual mais elegante.
                            width: 3, 
                            
                            // GARANTE que a linha é sólida. Se tiver algum número aqui > 0, ela fica tracejada.
                            dashArray: 0, 
                            
                            // Define o acabamento das pontas da linha. 'butt' é o padrão reto, 'round' é arredondado.
                            lineCap: 'butt' 
                        },
                        
                        // PARA GARANTIR: Verifique se não há uma textura sendo aplicada na linha
                        fill: {
                            // Certifique-se de que para gráficos de linha, o tipo seja sólido
                            type: 'solid', 
                            opacity: 1
                        },
                    legend: {
                        position: 'bottom',
                        fontSize: '11px',
                        fontFamily: 'Roboto, sans-serif',
                        itemMargin: { horizontal: 5, vertical: 5 }
                    },
                    // Força o tipo categoria para garantir a leitura exata do X
                    xaxis: {
                        type: 'category',
                        categories: years,
                       // tooltip: { enabled: false }, // Desliga o tooltip redundante do eixo X
                        labels: {
                            style: { fontSize: '11px', fontFamily: 'Roboto, sans-serif' }
                        }
                    },
                    // CORREÇÃO 2: Configuração do Tooltip
                    tooltip: {
                        theme: 'light',
                        shared: true,
                        intersect: false,
                        style: {
                            fontSize: '10px', // Diminui a fonte geral
                            fontFamily: 'Roboto, sans-serif'
                        },
                        y: {
                            // Trunca o NOME da série dentro do tooltip para não esmagar o gráfico
                            title: {
                                formatter: (seriesName: string) => {
                                    if (!seriesName) return '';
                                    return seriesName.length > 16 ? seriesName.substring(0, 16) + "..." : seriesName;
                                }
                            },
                            // Formata o VALOR
                           formatter: (val: number) => `${val} ${measureLabel}`
                        },
                        marker: { show: true }
                    }
                }
            };
        }
       
        // Caso de Linha Única (Sem quebra por grupo)
        return {
            series: [{ name: "Total", data: years.map(() => generateValue()) }],
            options: {
                ...baseOptions,
                chart: { ...baseOptions.chart, toolbar: { show: false } },
                xaxis: {
                    type: 'category',
                    categories: years,
                    //tooltip: { enabled: false },
                    labels: { style: { fontSize: '10px', fontFamily: 'Roboto, sans-serif' } }
                },
                tooltip: {
                    theme: 'light',
                    style: { fontSize: '10px', fontFamily: 'Roboto, sans-serif' },
                   y: { formatter: (val: number) => `${val} ${measureLabel}` }
                }
            }
        };
    }


    // 3. Pie / Donut (CORRIGIDO: Layout otimizado para legendas longas)
    if (type === 'pie' || type === 'donut') {
        const randomData = labels.map(() => generateValue());
        return {
            series: randomData,
            options: {
                ...baseOptions,
                labels: labels,
                
                legend: {
                    position: 'bottom', // Move para baixo, liberando a largura horizontal para a pizza
                    horizontalAlign: 'center',
                    fontSize: '10px',
                    fontFamily: 'Roboto, sans-serif',
                    offsetY: -10,
                    itemMargin: { horizontal: 5, vertical: 0 },
                    formatter: function(seriesName: string) {
                        // Segurança: se a string for absurdamente gigante, aplicamos truncação leve
                        return seriesName.length > 35 ? seriesName.substring(0, 35) + "..." : seriesName;
                    }
                },
               // PALETA CORPORATIVA ESTENDIDA (20 cores únicas, sérias e contrastantes)
colors: [
    // As 5 cores originais e clássicas do ApexCharts (Garante o visual padrão)
    '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', 
    
    // Extensão com cores vibrantes para não repetir nas fatias/linhas extras
    '#3F51B5', // Índigo
    '#546E7A', // Azul acinzentado
    '#D4526E', // Rosa escuro
    '#8D5B4C', // Marrom
    '#F86624', // Laranja forte
    '#D7263D', // Carmim
    '#1B998B', // Verde água
    '#2E294E', // Roxo bem escuro
    '#F46036', // Coral
    '#E2C044', // Mostarda
    '#A300D6', // Violeta neon
    '#00D8B6', // Turquesa
    '#E91E63', // Pink
    '#9C27B0', // Púrpura
    '#00BCD4'  // Ciano
  ],
                dataLabels: { enabled: true },
                plotOptions: {
                    pie: {
                        expandOnClick: true,
                        // MODO ZOOM: Reduz o tamanho do gráfico para 85% do espaço, evitando cortes no topo
                        customScale: 0.9,
                        donut: {
                            size: '65%'
                        }
                    }
                },
                tooltip: {
                    y: { formatter: (val: number) => `${val} ${measureLabel}` }
                }
            }
        };
    }
    // 4. Treemap
    if (type === 'treemap') {
        // Treemap exige formato { x: 'Nome', y: Valor } dentro do data
        const treemapData = labels.map(label => ({
            x: label,
            y: generateValue()
        }));


        return {
            series: [{ data: treemapData }],
            options: {
                ...baseOptions,
                legend: { show: false }, // Treemap geralmente não usa legenda externa
                dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 'bold' } },
                tooltip: {
                    y: { formatter: (val: number) => `${val} ${measureLabel}` }
                }


            }
        };
    }


 // 5. HEATMAP
    if (type === 'heatmap') {
        const xAxis = config.xAxisAttribute || 'ano';
        const yAxis = config.secondaryAttribute || 'municipio';
        
        // CORREÇÃO 1: Construção Inteligente do Filtro para o Mock!
        const heatmapFilters: Record<string, string> = {};
        if (config.secondaryValues && config.secondaryValues.length > 0) {
            heatmapFilters[yAxis] = config.secondaryValues.join(",");
        }

        // CORREÇÃO 2: A lista de Eixo Y local PRECISA refletir o que o usuário escolheu,
        // senão o Apex desenha 185 linhas inúteis mesmo com o Mock retornando apenas 3 cidades.
        const rows = config.secondaryValues && config.secondaryValues.length > 0
            ? config.secondaryValues
            : ["Homicídio Doloso", "Latrocínio", "Lesão Corporal", "Feminicídio"];

        const heatmapSeries = rows.map(rowLabel => ({
            name: rowLabel,
            data: labels.map(colLabel => ({
                x: colLabel,
                y: generateValue()
            }))
        }));

        // Ponto de quebra seguro entre o Card (menor) e o Zoom (maior)
        const BREAKPOINT = 650;

        return {
            
            series: heatmapSeries,
            options: {
                ...baseOptions,
                chart: {
                    ...baseOptions.chart,
                    toolbar: { show: false },
                    type: 'heatmap',
                    // Redraw ao redimensionar garante que o formatter rode novamente
                    redrawOnParentResize: true
                },
                
                states: {
                    hover: {
                        filter: {
                            type: 'darken',
                            value: 0.85
                        }
                    },
                },

                grid: {
                    padding: { right: 10, left: 10, bottom: 20 }
                },
                plotOptions: {
                    heatmap: {
                        shadeIntensity: 0,
                        radius: 4,        
                        enableShades: false,
                        colorScale: {
                            ranges: [
                                { from: 0, to: 20, color: '#93C5FD', name: 'Muito Baixo' },
                                { from: 20.001, to: 40, color: '#3B82F6', name: 'Baixo' },      
                                { from: 40.001, to: 60, color: '#1D4ED8', name: 'Médio' },      
                                { from: 60.001, to: 80, color: '#1E3A8A', name: 'Alto' },      
                                { from: 80.001, to: 10000, color: '#122456', name: 'Crítico' }
                            ]
                        }
                    }
                },
                dataLabels: { enabled: false },
                stroke: { width: 2, colors: ['#fff'] },
                
                // --- EIXO X  ---
                xaxis: {
                    type: 'category',
                    categories: labels,
                    tooltip: { enabled: false },
                    labels: {
                        rotateAlways: true,
                        rotate: -45,
                        hideOverlappingLabels: true,
                        trim: true,
                        maxHeight: 80,
                        style: { fontSize: '10px', fontFamily: 'Roboto, sans-serif' },
         
                        formatter: function (val: string) {
                            return val.split(' ');
                        }
                    }
                },
                
                // --- EIXO Y  ---
                yaxis: {
                    labels: {
                        // maxWidth gigante para evitar que o Apex faça o corte por conta própria no zoom
                        maxWidth: 400,
                        style: { fontSize: '10px', fontFamily: 'Roboto, sans-serif', fontWeight: 500 },
                        
                        formatter: (value: string, opts: any) => {
                            const width = opts?.w?.globals?.svgWidth || window.innerWidth || 0;

                            if (typeof value === 'string') {
                                if (width > BREAKPOINT) {
                                    // MODO ZOOM: Mostra o texto completo numa linha (como na sua imagem perfeita)
                                    return value;
                                }
                                // MODO CARD: Nós mesmos fazemos o corte para garantir que o Início apareça.
                                // Usamos 15 letras para caber no lado esquerdo sem espremer o gráfico.
                                return value.length > 15 ? value.substring(0, 15) + "..." : value;
                            }
                            return value;
                        }
                    }
                },
                
                legend: {
                    show: true,
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '10px',
                    fontFamily: 'Roboto, sans-serif',
                    offsetY: 0,
                    itemMargin: { horizontal: 5, vertical: 0 },
                    markers: { radius: 2, width: 10, height: 10 }
                },
                
                tooltip: {
                    theme: 'light',
                    y: { formatter: (val: number) => `${val} ${measureLabel}` },
                    x: { show: true }
                }
            }
        };
    }

    // 6. Colunas/Barras
    if ((type === 'bar-horizontal' || type === 'bar') && config.secondaryAttribute && config.secondaryValues?.length) {
         const subLabels = config.secondaryValues;
         
         const series = subLabels.map(subLabel => ({
             name: subLabel,
             data: labels.map(() =>  generateValue())
         }));


         return {
             series: series,
             options: {
                 ...baseOptions,
                 xaxis: {
                     categories: labels,
                     labels: {
                         hideOverlappingLabels: false,
                         rotateAlways: type === 'bar' ? true : false,
                         rotate: type === 'bar' ? -45 : {},
                         formatter: function (val: string) {
                            return type === 'bar' ? val.split(' ') : val;
                        }
                    }
              },
                 plotOptions: {
                    bar: type === 'bar-horizontal' ? { horizontal: true } : {},
                    expandedOnClick: true,
                    customScale: 0.7,
                    tooltip: { y: { formatter: (val: number) => `${val} ${measureLabel}` } }
                }
             }
         };
    }


    // Caso padrão (Barra Simples)
    const randomData = labels.map(() => generateValue());
    return {
        series: [{ name: "Quantidade", data: randomData }],
        options: {
            ...baseOptions,
           xaxis: {
                categories: labels,
                 labels: {
                         hideOverlappingLabels: false,
                         rotateAlways: type === 'bar' ? true : false,
                         rotate: type === 'bar' ? -45 : {},
                         formatter: function (val: string) {
                            return type === 'bar' ? val.split(' ') : val;
                        }
                    },
            },
          plotOptions: type === 'bar-horizontal' ? { bar: { horizontal: true } } : {},
          tooltip: { y: { formatter: (val: number) => `${val} ${measureLabel}` } }
    },
  }
}
