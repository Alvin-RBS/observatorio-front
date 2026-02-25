import { apiClient } from "@/service/api";
import { getAttributeValues } from "@/data/domainValues";


// ==========================================
// 1. TIPOS DE REQUISIÇÃO E RESPOSTA
// ==========================================


export interface RangeFilter {
  attributeId: string;
  startValue: string;  
  endValue: string;    
}


export interface DashboardRequestDTO {
  indicatorId: string;
  filters?: Record<string, string>;
  rangeFilter?: RangeFilter;        
  groupBy: string[];                
  metrics: string[];                  
}


export interface AggregatedData {
  [key: string]: any;
  total: number;      
}


export const getAggregatedData = async (
  payload: DashboardRequestDTO
): Promise<AggregatedData[]> => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const { groupBy, filters, rangeFilter } = payload;
      const mockData: AggregatedData[] = [];

      const getDynamicDomain = (attribute: string): string[] => {
        let domain: string[] = [];

        // 1. Respeita os filtros categóricos (ex: Município, Sexo) e a trava "__NONE__"
        if (filters && filters[attribute]) {
            if (filters[attribute] === "__NONE__") return []; 
            domain = filters[attribute].split(",").map(s => s.trim());
        } else {
            // Se não tem filtro específico, puxa todos os valores disponíveis
            domain = getAttributeValues(attribute);
        }

        // 2. O FILTRO DO CALENDÁRIO (rangeFilter)
        // Se a coluna for 'ano' e o usuário mexeu nas datas globais, nós podamos a lista!
        if (attribute === 'ano' && rangeFilter?.startValue && rangeFilter?.endValue) {
            
            // Extrai apenas o ano (os 4 primeiros caracteres de "YYYY-MM-DD")
            const startYear = parseInt(rangeFilter.startValue.substring(0, 4));
            const endYear = parseInt(rangeFilter.endValue.substring(0, 4));

            // Filtra o domínio mantendo APENAS os anos que estão dentro do novo calendário
            domain = domain.filter(y => {
                const yearNum = parseInt(y);
                return yearNum >= startYear && yearNum <= endYear;
            });
        }

        // Retorna a lista calculada se tiver algo
        if (domain.length > 0) {
            return domain;
        }

        // Regra 3: Fallback universal
        return []; 
      };

      // 2. EXTRAÇÃO DOS EIXOS
      const eixo1 = groupBy[0] || "categoria";
      const eixo2 = groupBy[1]; 

      const domain1 = getDynamicDomain(eixo1);

      // 3. GERAÇÃO CRUZADA (A Mágica Tipada)
      if (eixo2) {
          const domain2 = getDynamicDomain(eixo2);
          domain1.forEach(d1 => {
              domain2.forEach(d2 => {
                  mockData.push({
                      [eixo1]: d1,
                      [eixo2]: d2,
                      total: Math.floor(Math.random() * 80) + 5 // <--- CRAVADO COMO 'total'
                  });
              });
          });
      } else {
          domain1.forEach(d1 => {
              mockData.push({
                  [eixo1]: d1,
                  total: Math.floor(Math.random() * 300) + 20 // <--- CRAVADO COMO 'total'
              });
          });
      }

      if (!eixo2 && eixo1 !== 'ano' && eixo1 !== 'idade') {
          mockData.sort((a, b) => b.total - a.total);
      }

      resolve(mockData);
    }, 0); // Latência fingida para o loading girar!
  });
};

/*export const getAggregatedData = async (
  payload: DashboardRequestDTO
): Promise<AggregatedData[]> => {


  const response = await apiClient.post(
    "/api-backend/spreadsheet/api/dashboard/aggregate",
    payload
  );
  return response.data;
};*/




// ==========================================
// 3. ADAPTADORES (Transformam o retorno do Java para o ApexCharts)
// ==========================================


/**
 * Família 1: Gráficos de Eixo X/Y (Line, Bar, Area, etc)
 * Formato gerado: series: [{ name, data: [] }], categories: []
 */
export const transformToApexXYSeries = (
  data: AggregatedData[],
  xAxisAttribute: string,
  seriesAttribute?: string
) => {
  const categories = Array.from(
    new Set(data.map((item) => String(item[xAxisAttribute])))
  ).sort();


  let series: { name: string; data: number[] }[] = [];


  if (seriesAttribute) {
    const seriesNames = Array.from(
      new Set(data.map((item) => String(item[seriesAttribute])))
    );


    series = seriesNames.map((name) => {
      const dataPoints = categories.map((category) => {
        const found = data.find(
          (item) =>
            String(item[xAxisAttribute]) === category &&
            String(item[seriesAttribute]) === name
        );
        return found ? Number(found.total) : 0;
      });
      return { name, data: dataPoints };
    });
  } else {
    const dataPoints = categories.map((category) => {
      const found = data.find((item) => String(item[xAxisAttribute]) === category);
      return found ? Number(found.total) : 0;
    });
    series = [{ name: "Total", data: dataPoints }];
  }


  return { categories, series };
};


/**
 * Família 2: Gráficos Circulares (Pie, Donut)
 * Formato gerado: series: [10, 20], labels: ["A", "B"]
 */
export const transformToApexPieSeries = (
  data: AggregatedData[],
  labelAttribute: string
) => {
  const labels: string[] = [];
  const series: number[] = [];


  data.forEach(item => {
    labels.push(String(item[labelAttribute]));
    series.push(Number(item.total));
  });


  return { labels, series };
};


/**
 * Família 3: Gráficos de Matriz Espacial (Heatmap, Treemap)
 * Formato gerado: series: [{ name, data: [{ x, y }] }]
 */
export const transformToApexMatrixSeries = (
  data: AggregatedData[],
  xAxisAttribute: string,
  yAxisAttribute: string
) => {
  const yCategories = Array.from(new Set(data.map(item => String(item[yAxisAttribute]))));


  const series = yCategories.map(yCategory => {
    const yData = data.filter(item => String(item[yAxisAttribute]) === yCategory);
   
    const dataPoints = yData.map(item => ({
      x: String(item[xAxisAttribute]),
      y: Number(item.total)
    }));


    return {
      name: yCategory,
      data: dataPoints
    };
  });


  return { series };
};


/**
 * Família 4: Gráficos Geográficos (Mapa de Pernambuco)
 * Formato gerado: Record<string, number> (Ex: { "Recife": 10, "Olinda": 5 })
 */
export const transformToGeomapSeries = (
  data: AggregatedData[],
  locationAttribute: string // Ex: "municipio"
): Record<string, number> => {
  const mapData: Record<string, number> = {};


  data.forEach(item => {
    const city = String(item[locationAttribute]);
    const total = Number(item.total);
   
    // Alimenta o dicionário com a cidade e o total
    mapData[city] = total;
  });


  return mapData;
};
