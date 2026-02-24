"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApexOptions } from "apexcharts";

// --- TIPAGEM ---
export type ChartType = 
  | "line" 
  | "pie" 
  | "bar" 
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

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [isInitialized, setIsInitialized] = useState(false);

  //Lê o localStorage assim que o navegador carrega a página
  useEffect(() => {
    const savedConfig = localStorage.getItem("@observatorio:dashboard_config");
    if (savedConfig) {
      try {
        setDashboardData(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Erro ao ler as configurações do Dashboard:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // FUNÇÃO CENTRAL: Atualiza o React e o LocalStorage ao mesmo tempo
  const saveAndSetData = (newData: DashboardData) => {
    setDashboardData(newData);
    localStorage.setItem("@observatorio:dashboard_config", JSON.stringify(newData));
  };

  // MÉTODOS DE MANIPULAÇÃO
  const updateIndicatorCharts = (indicatorId: string, charts: ChartConfig[]) => {
    saveAndSetData({
      ...dashboardData,
      [indicatorId]: charts
    });
  };

  // reordenação do Drag & Drop
  const updateChartOrder = (indicatorId: string, charts: ChartConfig[]) => {
    updateIndicatorCharts(indicatorId, charts);
  };

  const getChartsByIndicator = (indicatorId: string) => {
    return dashboardData[indicatorId] || [];
  };

  // Evita o erro de hidratação do Next.js segurando a renderização até o storage ser lido
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