import { apiClient } from "@/service/api";

interface ImportPayload {
  indicatorId: string;
  mappings: Record<string, string>;
  fileColumns: string[]; //Lista das colunas originais para auditoria
}

export const uploadImportData = async (
  file: File,
  indicatorId: string,

  mappings: Record<string, { excelColumn: string; status: string }>,
  fileColumns: string[]
) => {
  const formData = new FormData();

  // 1. Anexa o arquivo binário
  formData.append("file", file);

  // 2. Transforma o objeto de mapeamento complexo em algo simples para o Backend
  const simplifiedMappings: Record<string, string> = {};
  
  Object.keys(mappings).forEach((systemId) => {
    const map = mappings[systemId];
    if (map && map.excelColumn) {
        simplifiedMappings[systemId] = map.excelColumn;
    }
  });

  // 3. Monta o objeto de metadados
  const metadata: ImportPayload = {
    indicatorId,
    mappings: simplifiedMappings,
    fileColumns
  };

  // 4. Anexa os metadados como JSON stringificado
  formData.append("metadata", JSON.stringify(metadata));

const response = await apiClient.post("/api/spreadsheet/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};