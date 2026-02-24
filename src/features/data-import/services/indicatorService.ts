import { apiClient } from "@/service/api";

// 1. A Tipagem exata do JSON do Spring Boot
export interface IndicatorAttribute {
  id: string;
  label: string;
  valueType: 'TEXT' | 'NUMBER' | 'DATE';
  required: boolean;
}

export interface IndicatorConfig {
  id: string;
  label: string;
  type: 'ABSOLUTE' | 'RATE';
  multiplier?: number;
  calculationAttributes: IndicatorAttribute[];
  contextAttributes: IndicatorAttribute[];
}

// 2. Rota para o Step 2 (Listar todos)
export const getAllIndicators = async (): Promise<IndicatorConfig[]> => {
  const response = await apiClient.get("/api-backend/spreadsheet/api/indicators");
  return response.data;
};

// 3. Rota para o Step 4 (Pegar a configuração de um só)
export const getIndicatorById = async (id: string): Promise<IndicatorConfig> => {
  const response = await apiClient.get(`/api-backend/spreadsheet/api/indicators/${id}`);
  return response.data;
};