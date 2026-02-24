"use client";

import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Alert, Button, TextField, Stack 
} from "@mui/material";
import { useState, useMemo, useRef, useEffect } from "react";

interface Step3ConfirmTitleProps {
  previewMatrix: any[][]; // Recebe os dados brutos do Excel
  totalRows: number;
  onConfirm: (headers: string[]) => void;
}

export default function Step3ConfirmTitle({ previewMatrix, totalRows, onConfirm }: Step3ConfirmTitleProps) {
  const [headerRowIndex, setHeaderRowIndex] = useState(1); // Linha atual (1-based)
  const [isEditing, setIsEditing] = useState(false);
  const [tempRow, setTempRow] = useState(1);

  // Referência para scroll automático (opcional, para focar na linha escolhida)
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  // 1. Identifica qual é o array de headers baseado na escolha atual
  const selectedHeaders = useMemo(() => {
    if (!previewMatrix || previewMatrix.length === 0) return [];
    const actualIndex = headerRowIndex - 1;
    if (actualIndex < 0 || actualIndex >= previewMatrix.length) return [];
    
    return previewMatrix[actualIndex] as string[];
  }, [previewMatrix, headerRowIndex]);

  // Efeito para scrollar até a linha selecionada quando ela mudar (UX melhorada)
  useEffect(() => {
    if (selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [headerRowIndex, isEditing]);

  const handleSaveNewRow = () => {
    if (tempRow > 0 && previewMatrix && tempRow <= previewMatrix.length) {
        setHeaderRowIndex(tempRow);
        setIsEditing(false);
    } else {
        alert("Linha inválida. Verifique o número digitado.");
    }
  };

  const handleConfirmClick = () => {
      onConfirm(selectedHeaders);
  };

  const recordsCount = Math.max(0, totalRows - headerRowIndex);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold">Confirmar colunas</Typography>
        <Typography variant="body2" color="text.secondary">
          Veja a prévia abaixo. A linha destacada em <span style={{fontWeight: 'bold', color: '#1976d2'}}>azul</span> será usada como título das colunas.
        </Typography>
      </Box>

      {/* Tabela com Scroll */}
      <TableContainer 
        component={Paper} 
        variant="outlined" 
        sx={{ 
            borderRadius: 2, 
            maxHeight: 400, // Altura fixa para permitir scroll vertical
            overflow: 'auto',
            mb: 2,
            border: '1px solid #E0E0E0'
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {/* Coluna extra para mostrar o número da linha */}
              <TableCell sx={{ bgcolor: "#f5f5f5", width: 50, fontWeight: 'bold', color: 'text.secondary' }}>#</TableCell>
              
              {/* Renderiza as colunas baseadas na maior linha ou na linha selecionada para manter a estrutura */}
              {selectedHeaders.map((_, idx) => (
                <TableCell key={idx} sx={{ bgcolor: "#f5f5f5", color: "text.secondary", fontWeight: "bold" }}>
                   Coluna {idx + 1}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {previewMatrix && previewMatrix.length > 0 ? previewMatrix.map((row, index) => {
                const rowNum = index + 1;
                const isSelected = rowNum === headerRowIndex;
                const isBefore = rowNum < headerRowIndex;

                // Estilos Condicionais
                let rowBg = "white";
                let textColor = "text.primary";
                let fontWeight = "normal";

                if (isSelected) {
                    rowBg = "#1976d2"; // Azul destaque
                    textColor = "white";
                    fontWeight = "bold";
                } else if (isBefore) {
                    rowBg = "#f5f5f5"; // Cinza (ignorado)
                    textColor = "text.disabled";
                }

                return (
                  <TableRow 
                    key={index} 
                    ref={isSelected ? selectedRowRef : null} // Referência para scroll
                    sx={{ bgcolor: rowBg }}
                  >
                    {/* Célula do Número da Linha */}
                    <TableCell sx={{ color: textColor, fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>
                        {rowNum}
                    </TableCell>

                    {/* Células de Dados */}
                    {row.map((cell: any, cellIdx: number) => (
                        <TableCell 
                            key={cellIdx} 
                            sx={{ 
                                color: textColor, 
                                fontWeight: fontWeight,
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}
                        >
                            {cell !== undefined && cell !== null ? String(cell) : ""}
                        </TableCell>
                    ))}
                  </TableRow>
                );
            }) : (
                <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                        Nenhum dado para exibir.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info da Linha Atual */}
      <Alert severity="info" sx={{ mt: 2, alignItems: "center" }}>
        O sistema identificou a <b>Linha {headerRowIndex}</b> como cabeçalho. 
        <br/>
        As linhas anteriores à escolhida como cabeçalho serão ignoradas. 
        O arquivo tem <b>{selectedHeaders.length} colunas</b> e <b>{recordsCount} linhas</b>.
      </Alert>

      {/*(1 a {headerRowIndex - 1}) linhas que serão ignoradas.*/} 

      {/* ÁREA DE AÇÃO */}
       <Box mt={4} display="flex" justifyContent="center" width="100%">
        {!isEditing ? (
            <Stack direction="row" spacing={2}>
                <Button 
                    variant="contained" 
                    onClick={handleConfirmClick}
                    disabled={selectedHeaders.length === 0}
                    sx={{ bgcolor: "#003B88", fontWeight: "bold", textTransform: "none", px: 3 }}
                >
                    SIM, USAR LINHA {headerRowIndex}
                </Button>
                
                <Button 
                    variant="outlined" 
                    onClick={() => {
                        setTempRow(headerRowIndex);
                        setIsEditing(true);
                    }}
                    sx={{ fontWeight: "bold", textTransform: "none", px: 3 }}
                >
                    NÃO, ESCOLHER OUTRA
                </Button>
            </Stack>
        ) : (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#F8F9FA", maxWidth: 500, borderColor: "#003B88" }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom mb={3}>
                    Digite o número da linha que contém os títulos:
                </Typography>
                
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField 
                        type="number" 
                        size="small" 
                        label="Número da linha" 
                        value={tempRow}
                        onChange={(e) => setTempRow(Number(e.target.value))}
                        sx={{ bgcolor: "white", width: 120 }}
                        inputProps={{ min: 1, max: previewMatrix.length }}
                    />
                    <Button 
                        variant="contained" 
                        size="small"
                        onClick={handleSaveNewRow}
                        sx={{ bgcolor: "#003B88" }}
                    >
                        Atualizar
                    </Button>
                    <Button 
                        color="primary" 
                        variant="outlined"
                        size="small"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancelar
                    </Button>
                </Stack>
            </Paper>
        )}
      </Box>
    </Box>
  );
}