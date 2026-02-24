import { apiClient } from "@/service/api";

interface ImportPayload {
  indicatorId: string;
  mappings: Record<string, number>; 
}

export const uploadImportData = async (
  file: File,
  indicatorId: string,
  mappings: Record<string, { excelColumn: string; status: string }>,
  fileColumns: string[] 
) => {
  const formData = new FormData();
  formData.append("file", file);

  const numericMappings: Record<string, number> = {};
  
  Object.keys(mappings).forEach((systemId) => {
    const columnName = mappings[systemId]?.excelColumn;
    
    if (columnName) {
        const columnIndex = fileColumns.indexOf(columnName);
        if (columnIndex !== -1) {
            numericMappings[systemId] = columnIndex;
        }
    }
  });

  const payloadData: ImportPayload = {
    indicatorId,
    mappings: numericMappings,
  };

  formData.append("payload", JSON.stringify(payloadData));

  const response = await apiClient.post("/api-backend/spreadsheet/api/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const validateImportMappings = async (
  indicatorId: string,
  mappings: Record<string, { excelColumn: string; status: string }>,
  fileColumns: string[] 
) => {
  
  const numericMappings: Record<string, number> = {};
  
  Object.keys(mappings).forEach((systemId) => {
    const columnName = mappings[systemId]?.excelColumn;
    
    if (columnName) {
        const columnIndex = fileColumns.indexOf(columnName);
        if (columnIndex !== -1) {
            numericMappings[systemId] = columnIndex;
        }
    }
  });

  const response = await apiClient.post("/api-backend/spreadsheet/api/import/validate", {
    indicatorId,
    mappings: numericMappings
  });

  return response.data;
};