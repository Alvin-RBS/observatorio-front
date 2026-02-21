"use client";

import { createContext, useContext, useState, ReactNode } from "react";
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
  | "bar-vertical"    
  | "heatmap"         
  | "treemap"         
  | "radar";          

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  series: any[]; 
  options: ApexOptions; 
}

// Estrutura do Estado: Chave = Nome do Indicador, Valor = Lista de Gráficos
interface DashboardData {
  [indicatorName: string]: ChartConfig[];
}

interface DashboardContextType {
  dashboardData: DashboardData;
  updateIndicatorCharts: (indicatorName: string, charts: ChartConfig[]) => void;
  getChartsByIndicator: (indicatorName: string) => ChartConfig[];
}

// --- DADOS INICIAIS (MOCK) ---
const commonOptions: ApexOptions = {
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  noData: {
    text: "Sem ocorrências para estes filtros",
    align: 'center',
    verticalAlign: 'middle',
    style: { color: '#6B7280', fontSize: '14px', fontFamily: 'Roboto' }
  }
};

// Dados completos para alimentar o mapa e tabelas
const dadosPernambuco = [
  // Região Metropolitana e Grandes Centros
  { city: "Recife", value: 540 },
  { city: "Jaboatão dos Guararapes", value: 480 },
  { city: "Olinda", value: 450 },
  { city: "Caruaru", value: 410 },
  { city: "Petrolina", value: 390 },
  { city: "Paulista", value: 350 },
  { city: "Cabo de Santo Agostinho", value: 320 },
  { city: "Camaragibe", value: 280 },
  { city: "Garanhuns", value: 250 },
  { city: "Vitória de Santo Antão", value: 230 },
  { city: "Igarassu", value: 200 },
  { city: "São Lourenço da Mata", value: 190 },
  { city: "Abreu e Lima", value: 180 },
  { city: "Ipojuca", value: 175 },
  { city: "Serra Talhada", value: 160 },
  { city: "Araripina", value: 150 },
  { city: "Gravatá", value: 145 },
  { city: "Carpina", value: 140 },
  { city: "Goiana", value: 135 },
  { city: "Belo Jardim", value: 130 },
  { city: "Arcoverde", value: 125 },
  { city: "Ouricuri", value: 120 },
  { city: "Escada", value: 115 },
  { city: "Pesqueira", value: 110 },
  { city: "Surubim", value: 105 },
  { city: "Palmares", value: 100 },
  { city: "Bezerros", value: 95 },
  { city: "Moreno", value: 90 },
  { city: "Salgueiro", value: 85 },
  { city: "Santa Cruz do Capibaribe", value: 210 }, 

  // Outros Municípios
  { city: "Afogados da Ingazeira", value: 75 },
  { city: "Afrânio", value: 30 },
  { city: "Agrestina", value: 45 },
  { city: "Água Preta", value: 55 },
  { city: "Águas Belas", value: 60 },
  { city: "Alagoinha", value: 20 },
  { city: "Aliança", value: 35 },
  { city: "Altinho", value: 25 },
  { city: "Amaraji", value: 28 },
  { city: "Angelim", value: 15 },
  { city: "Araçoiaba", value: 32 },
  { city: "Barra de Guabiraba", value: 18 },
  { city: "Barreiros", value: 65 },
  { city: "Belém de Maria", value: 12 },
  { city: "Belém de São Francisco", value: 40 },
  { city: "Betânia", value: 22 },
  { city: "Bodocó", value: 50 },
  { city: "Bom Conselho", value: 58 },
  { city: "Bom Jardim", value: 42 },
  { city: "Bonito", value: 48 },
  { city: "Brejão", value: 10 },
  { city: "Brejinho", value: 8 },
  { city: "Brejo da Madre de Deus", value: 52 },
  { city: "Buenos Aires", value: 14 },
  { city: "Buíque", value: 62 },
  { city: "Cabrobó", value: 70 }, 
  { city: "Cachoeirinha", value: 26 },
  { city: "Caetés", value: 38 },
  { city: "Calçado", value: 11 },
  { city: "Calumbi", value: 9 },
  { city: "Camocim de São Félix", value: 16 },
  { city: "Camutanga", value: 13 },
  { city: "Canhotinho", value: 33 },
  { city: "Capoeiras", value: 24 },
  { city: "Carnaíba", value: 21 },
  { city: "Carnaubeira da Penha", value: 19 },
  { city: "Casinhas", value: 15 },
  { city: "Catende", value: 44 },
  { city: "Cedro", value: 17 },
  { city: "Chã de Alegria", value: 23 },
  { city: "Chã Grande", value: 27 },
  { city: "Condado", value: 31 },
  { city: "Correntes", value: 29 },
  { city: "Cortês", value: 18 },
  { city: "Cumaru", value: 12 },
  { city: "Cupira", value: 36 },
  { city: "Custódia", value: 46 },
  { city: "Dormentes", value: 25 },
  { city: "Exu", value: 41 },
  { city: "Feira Nova", value: 34 },
  { city: "Ferreiros", value: 16 },
  { city: "Flores", value: 28 },
  { city: "Floresta", value: 55 },
  { city: "Frei Miguelinho", value: 14 },
  { city: "Gameleira", value: 37 },
  { city: "Glória do Goitá", value: 43 },
  { city: "Granito", value: 10 },
  { city: "Iati", value: 22 },
  { city: "Ibimirim", value: 39 },
  { city: "Ibirajuba", value: 9 },
  { city: "Iguaracy", value: 11 },
  { city: "Ilha de Itamaracá", value: 60 },
  { city: "Inajá", value: 30 },
  { city: "Ingazeira", value: 7 },
  { city: "Ipubi", value: 45 },
  { city: "Itacuruba", value: 8 },
  { city: "Itaíba", value: 35 },
  { city: "Itambé", value: 40 },
  { city: "Itapetim", value: 20 },
  { city: "Itapissuma", value: 50 },
  { city: "Itaquitinga", value: 26 },
  { city: "Jaqueira", value: 15 },
  { city: "Jataúba", value: 22 },
  { city: "Jatobá", value: 18 },
  { city: "João Alfredo", value: 38 },
  { city: "Joaquim Nabuco", value: 24 },
  { city: "Jucati", value: 13 },
  { city: "Jupi", value: 19 },
  { city: "Jurema", value: 21 },
  { city: "Lagoa do Carro", value: 27 },
  { city: "Lagoa do Itaenga", value: 31 },
  { city: "Lagoa do Ouro", value: 14 },
  { city: "Lagoa dos Gatos", value: 17 },
  { city: "Lagoa Grande", value: 33 },
  { city: "Lajedo", value: 52 },
  { city: "Limoeiro", value: 68 },
  { city: "Macaparana", value: 29 },
  { city: "Machados", value: 16 },
  { city: "Manari", value: 25 },
  { city: "Maraial", value: 18 },
  { city: "Mirandiba", value: 20 },
  { city: "Nazaré da Mata", value: 47 },
  { city: "Orobó", value: 24 },
  { city: "Orocó", value: 15 },
  { city: "Palmeirina", value: 8 },
  { city: "Panelas", value: 27 },
  { city: "Paranatama", value: 12 },
  { city: "Parnamirim", value: 28 },
  { city: "Passira", value: 36 },
  { city: "Paudalho", value: 85 },
  { city: "Pedra", value: 32 },
  { city: "Petrolândia", value: 45 },
  { city: "Poção", value: 14 },
  { city: "Pombos", value: 30 },
  { city: "Primavera", value: 19 },
  { city: "Quipapá", value: 22 },
  { city: "Quixaba", value: 9 },
  { city: "Riacho das Almas", value: 25 },
  { city: "Ribeirão", value: 58 },
  { city: "Rio Formoso", value: 28 },
  { city: "Sairé", value: 15 },
  { city: "Salgadinho", value: 10 },
  { city: "Saloá", value: 18 },
  { city: "Sanharó", value: 33 },
  { city: "Santa Cruz", value: 12 },
  { city: "Santa Cruz da Baixa Verde", value: 14 },
  { city: "Santa Filomena", value: 16 },
  { city: "Santa Maria da Boa Vista", value: 55 },
  { city: "Santa Maria do Cambucá", value: 19 },
  { city: "Santa Terezinha", value: 11 },
  { city: "São Benedito do Sul", value: 15 },
  { city: "São Bento do Una", value: 65 },
  { city: "São Caitano", value: 48 },
  { city: "São João", value: 27 },
  { city: "São Joaquim do Monte", value: 23 },
  { city: "São José da Coroa Grande", value: 42 },
  { city: "São José do Belmonte", value: 40 },
  { city: "São José do Egito", value: 50 },
  { city: "São Vicente Férrer", value: 21 },
  { city: "Serrita", value: 24 },
  { city: "Sertânia", value: 46 },
  { city: "Sirinhaém", value: 52 },
  { city: "Solidão", value: 7 },
  { city: "Tabira", value: 38 },
  { city: "Tacaimbó", value: 16 },
  { city: "Tacaratu", value: 29 },
  { city: "Tamandaré", value: 60 },
  { city: "Taquaritinga do Norte", value: 35 },
  { city: "Terezinha", value: 9 },
  { city: "Terra Nova", value: 13 },
  { city: "Timbaúba", value: 75 },
  { city: "Toritama", value: 80 },
  { city: "Tracunhaém", value: 22 },
  { city: "Trindade", value: 48 },
  { city: "Triunfo", value: 25 },
  { city: "Tupanatinga", value: 30 },
  { city: "Tuparetama", value: 14 },
  { city: "Venturosa", value: 26 },
  { city: "Verdejante", value: 11 },
  { city: "Vertente do Lério", value: 10 },
  { city: "Vertentes", value: 28 },
  { city: "Vicência", value: 32 },
  { city: "Xexéu", value: 19 }
];

const INITIAL_DATA: DashboardData = {
  "1": [ // ID 1: CVLI
    {
      id: "v-line", title: "Homicídios entre 2019 e 2025", type: "line",
      series: [{ name: "Ocorrências", data: [30, 40, 35, 50, 49, 60, 70] }],
      options: { ...commonOptions, colors: ["#2E93fA"], xaxis: { categories: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"] } }
    },
    {
      id: "v-map", title: "Ocorrências por localidade", type: "geomap",
      series: [{ name: "Ocorrências", data: dadosPernambuco.map(d => d.value) }],
      options: { ...commonOptions, xaxis: { categories: dadosPernambuco.map(d => d.city) } }
    },
    {
      id: "v-pie", title: "Cor de suspeito", type: "pie",
      series: [44, 55, 13, 43, 22],
      options: { ...commonOptions, labels: ["Branco", "Pardo", "Amarelo", "Negro", "N/I"] }
    }
  ],
  "2": [ // ID 2: Feminicídio
    {
      id: "f-bar", title: "Idade das vítimas", type: "bar",
      series: [{ data: [12, 45, 30, 10], name: "Ocorrências" }],
      options: { ...commonOptions, xaxis: { categories: ["0-17", "18-29", "30-49", "50+"] } }
    }
  ],
  "3": [], // ID 3: Apreensão de Armas (Começa vazio)
  "4": [], // ID 4: Roubo a Transeunte (Começa vazio)
  "5": []  // ID 5: Homicídios de 18 a 29 anos (Começa vazio)
};

//Provider

interface DashboardContextType {
  dashboardData: DashboardData;
  updateIndicatorCharts: (indicatorId: string, charts: ChartConfig[]) => void;
  getChartsByIndicator: (indicatorId: string) => ChartConfig[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardData>(INITIAL_DATA);

  // Agora usamos o indicatorId (ex: "1") como chave
  const updateIndicatorCharts = (indicatorId: string, charts: ChartConfig[]) => {
    setDashboardData((prev) => ({
      ...prev,
      [indicatorId]: charts
    }));
  };

  const getChartsByIndicator = (indicatorId: string) => {
    return dashboardData[indicatorId] || [];
  };

  return (
    <DashboardContext.Provider value={{ dashboardData, updateIndicatorCharts, getChartsByIndicator }}>
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