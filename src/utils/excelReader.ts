import * as XLSX from "xlsx";

export const readExcelPreview = (file: File, previewLimit = 50): Promise<{ matrix: any[][], totalRows: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;

        // 1.'cellDates: true' deve ficar na leitura do Workbook
        const workbook = XLSX.read(data, { 
            type: "array",
            cellDates: true // converte os números serializados em Objetos JS Date imediatamente
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 2. Extração para JSON
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
            header: 1, 
            raw: true, 
            defval: "" 
        });

        // 3. Limpeza e Formatação
        const cleanData = jsonData
          .filter((row: any[]) => {
            if (!row || row.length === 0) return false;
            return row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== "");
          })
          .map((row: any[]) => {
            return row.map((cell) => {
              // 4. Formatação Manual: Se for data, força o padrão BR
              if (cell instanceof Date) {

                 return cell.toLocaleDateString("pt-BR"); 
              }
              return cell;
            });
          });

        const totalRows = cleanData.length;

        const matrix = cleanData.slice(0, previewLimit);

        resolve({ matrix, totalRows });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};