"use client";


import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApexOptions } from "apexcharts";


// --- TIPAGEM ---
export type ChartType =
  | "line"
  | "pie"
  | "area"
  | "donut"
  | "geomap"          
  | "bar-horizontal"  
  | "bar"    
  | "heatmap"        
  | "treemap"                


export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  series: any[];
  options: ApexOptions;
  groupBy?: string[];
  metrics?: string[];
  chartFilters?: Record<string, string>;
}


interface DashboardData {
  [indicatorId: string]: ChartConfig[];
}


interface DashboardContextType {
  dashboardData: DashboardData;
  updateIndicatorCharts: (indicatorId: string, charts: ChartConfig[]) => void;
  updateChartOrder: (indicatorId: string, charts: ChartConfig[]) => void;
  getChartsByIndicator: (indicatorId: string) => ChartConfig[];
}


// ==========================================
// MOCK INICIAL (O padrão caso o usuário não tenha salvo nada)
// ==========================================
const DEFAULT_DASHBOARD_DATA: DashboardData = {
  "cvli": [
    // --- FAMÍLIA 4: GEOMAP ---
  /*  {
      id: "cvli-mapa",
      title: "Distribuição Geográfica (CVLI)",
      type: "geomap",
      groupBy: ["municipio"],
      metric: "total_vitimas",
      series: [],
      options: {}
    },


   // --- FAMÍLIA 1: X/Y (Bar, Line, Area) ---
    {
      id: "cvli-bar-natureza",
      title: "Vítimas por Natureza Jurídica",
      type: "bar",
      groupBy: ["natureza_juridica"],
      metric: "total_vitimas",
      series: [],
      options: { xaxis: { categories: [] } }
    },
    {
      id: "cvli-bar-horizontal",
      title: "Top Municípios com mais Ocorrências",
      type: "bar-horizontal",
      groupBy: ["municipio"],
      metric: "total_vitimas",
      series: [],
      options: { plotOptions: { bar: { horizontal: true } }, xaxis: { categories: [] } }
    },
    {
      id: "cvli-linha-tempo",
      title: "Evolução Temporal por Sexo",
      type: "line",
      groupBy: ["ano", "sexo"], // Eixo X: ano | Subdivisão das linhas: sexo
      metric: "total_vitimas",
      series: [],
      options: { stroke: { curve: 'smooth' }, xaxis: { categories: [] } }
    },
    {
      id: "cvli-area",
      title: "Volume Total ao Longo do Tempo",
      type: "area",
      groupBy: ["ano"],
      metric: "total_vitimas",
      series: [],
      options: { stroke: { curve: 'straight' }, xaxis: { categories: [] }, fill: { opacity: 0.3 } }
    },*/


    // --- FAMÍLIA 2: CIRCULARES (Pie, Donut) ---
    {
      id: "cvli-pie-sexo",
      title: "Proporção por Sexo",
      type: "pie",
      groupBy: ["sexo"],
      metrics: ["total_vitimas"],
      series: [],
      options: { labels: [] }
    },
    /*{
      id: "cvli-donut-idade",
      title: "Vítimas por Faixa Etária",
      type: "donut",
      groupBy: ["faixa_etaria"], // Assumindo que você tem esse atributo configurado
      metric: "total_vitimas",
      series: [],
      options: { labels: [], plotOptions: { pie: { donut: { size: '65%' } } } }
    },


    // --- FAMÍLIA 3: MATRIZ (Heatmap, Treemap) ---
    {
      id: "cvli-heatmap",
      title: "Concentração: Dia da Semana vs Turno",
      type: "heatmap",
      groupBy: ["dia_semana", "turno"], // Eixo X: dia_semana | Eixo Y: turno
      metric: "total_vitimas",
      series: [],
      options: {
        dataLabels: { enabled: false },
        plotOptions: { heatmap: { colorScale: { ranges: [{ from: 0, to: 100, color: '#003380' }] } } }
      }
    },
    {
      id: "cvli-treemap",
      title: "Proporção de Cidades Afetadas",
      type: "treemap",
      groupBy: ["municipio"], // Treemap agrupa de forma hierárquica/espacial
      metric: "total_vitimas",
      series: [],
      options: { legend: { show: false } }
    }
  ],


  // --- EXEMPLO COM OUTRO INDICADOR (Para testar a aba de Feminicídio) ---
  "feminicidio": [
    {
      id: "fem-mapa",
      title: "Mapa do Feminicídio em PE",
      type: "geomap",
      groupBy: ["municipio"],
      metric: "total_vitimas",
      series: [],
      options: {}
    },
    {
      id: "fem-linha",
      title: "Evolução Histórica",
      type: "line",
      groupBy: ["ano"],
      metric: "total_vitimas",
      series: [],
      options: { stroke: { curve: 'smooth', colors: ['#E91E63'] }, xaxis: { categories: [] } }
    }*/
  ]
};


const DashboardContext = createContext<DashboardContextType | undefined>(undefined);


export function DashboardProvider({ children }: { children: ReactNode }) {
  // Inicia com o padrão ao invés de vazio
  const [dashboardData, setDashboardData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [isInitialized, setIsInitialized] = useState(false);


  useEffect(() => {
    const savedConfig = localStorage.getItem("@observatorio:dashboard_config");
    if (savedConfig) {
      try {
        setDashboardData(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Erro ao ler as configurações do Dashboard:", error);
      }
    } else {
      // Se não tem nada salvo, salva o padrão no cache para a próxima vez
      localStorage.setItem("@observatorio:dashboard_config", JSON.stringify(DEFAULT_DASHBOARD_DATA));
    }
    setIsInitialized(true);
  }, []);


  const saveAndSetData = (newData: DashboardData) => {
    setDashboardData(newData);
    localStorage.setItem("@observatorio:dashboard_config", JSON.stringify(newData));
  };


  const updateIndicatorCharts = (indicatorId: string, charts: ChartConfig[]) => {
    saveAndSetData({
      ...dashboardData,
      [indicatorId]: charts
    });
  };


  const updateChartOrder = (indicatorId: string, charts: ChartConfig[]) => {
    updateIndicatorCharts(indicatorId, charts);
  };


  const getChartsByIndicator = (indicatorId: string) => {
    return dashboardData[indicatorId] || [];
  };


  if (!isInitialized) return null;


  return (
    <DashboardContext.Provider value={{ dashboardData, updateIndicatorCharts, updateChartOrder, getChartsByIndicator }}>
      {children}
    </DashboardContext.Provider>
  );
}


export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard deve ser usado dentro de um DashboardProvider");
  }
  return context;
}
