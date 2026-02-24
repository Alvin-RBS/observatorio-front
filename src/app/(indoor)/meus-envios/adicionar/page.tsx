"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Paper, Stepper, Step, StepLabel, Button, Typography, Container, CircularProgress, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { uploadImportData, validateImportMappings } from "@/features/data-import/services/importService";
import { getIndicatorById, IndicatorConfig } from "@/features/data-import/services/indicatorService";
import Step0Upload from "@/features/data-import/components/Step0Upload";
import Step1Indicator from "@/features/data-import/components/Step1Indicator";
import Step2ConfirmTitle from "@/features/data-import/components/Step2ConfirmTitle";
import Step3MapColumns from "@/features/data-import/components/Step3MapColumns"; 
import Step4Review from "@/features/data-import/components/Step4Review";
import { useFile } from "@/context/FileContext"; 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { readExcelPreview } from "@/utils/excelReader";

const steps = [
  "Enviar arquivos",
  "Selecionar indicador",
  "Confirmar título",
  "Relacionar colunas",
  "Revisar"
];

export default function AdicionarDadosPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const stepContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    const timer = setTimeout(() => {
      if (stepContainerRef.current) {
        stepContainerRef.current.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
        });
      }
    }, 1000); 
    return () => clearTimeout(timer);
  }, [activeStep]);

  const { uploadedFile, setUploadedFile: setContextFile } = useFile();
  const [file, setFile] = useState<File | null>(null);
  const [indicatorId, setIndicatorId] = useState("");
  const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [previewMatrix, setPreviewMatrix] = useState<any[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columnMappings, setColumnMappings] = useState<any>({}); 
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!indicatorId) return;
    
    const fetchConfig = async () => {
      try {
        const config = await getIndicatorById(indicatorId);
        setIndicatorConfig(config);
      } catch (error) {
        console.error("Erro ao buscar a configuração do indicador", error);
        toast.error("Erro de comunicação com o servidor.");
      }
    };
    
    fetchConfig();
  }, [indicatorId]);

  useEffect(() => {
    if (uploadedFile) {
      handleFileChange(uploadedFile); 
      setActiveStep(1); 
      setContextFile(null); 
    }
  }, [uploadedFile]);

  const handleFileChange = async (newFile: File | null) => {
    setFile(newFile);

    if (newFile) {
      try {
        const { matrix, totalRows } = await readExcelPreview(newFile);
        setPreviewMatrix(matrix);
        setTotalRows(totalRows);
        
        if (matrix.length > 0) {
            const defaultHeaders = matrix[0] as string[];
            setFileColumns(defaultHeaders);
            setColumnMappings({});
        }

      } catch (error) {
        toast.error("Erro ao ler o arquivo. Verifique se é um Excel válido.");
        setFile(null);
        setFileColumns([]);
        setPreviewMatrix([]);
        setTotalRows(0);
      }
    } else {
      setFileColumns([]);
      setColumnMappings({});
      setPreviewMatrix([]);
      setTotalRows(0);
    }
  };

  const handleConfirmHeaders = (confirmedHeaders: string[]) => {
      setFileColumns(confirmedHeaders);
      setColumnMappings({});
      setActiveStep(3);
  };
  
  const handleNext = async () => {

    if (activeStep === 3) {
      try {
        setIsUploading(true); // Usamos o mesmo state para girar o loading no botão

        console.log("🕵️ Mapeamento enviado para o Java:", columnMappings);
        
        const result = await validateImportMappings(indicatorId, columnMappings, fileColumns);
        
        if (!result.valid) {
          toast.error("Atenção: O mapeamento das colunas é inválido ou incompatível.", {
            style: { background: '#FFA000', color: '#fff' } // Laranja de alerta
          });
          setIsUploading(false);
          return; // Para a execução aqui, impedindo de ir pro Step 4
        }
      } catch (error) {
        console.error("Erro na validação do servidor:", error);
        toast.error("Falha ao validar colunas com o servidor.");
        setIsUploading(false);
        return; // Para a execução em caso de erro de rede
      } finally {
        setIsUploading(false);
      }
    }
    
    if (activeStep < 4) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    if (activeStep === 4) {
      if (!file) return;

      try {
        setIsUploading(true);
        await uploadImportData(file, indicatorId, columnMappings, fileColumns);

        setActiveStep(5);
        toast.success("Dados enviados com sucesso!");
        
      } catch (error) {
        console.error("Erro ao enviar:", error);
        toast.error("Falha ao enviar. Verifique sua conexão.", {
            style: { background: '#D32F2F', color: '#fff' }
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      router.push("/home");
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

const isStepValid = () => {
    if (activeStep === 0) return !!file;
    if (activeStep === 1) return !!indicatorId && !!indicatorConfig; // Só avança se o Java já tiver respondido
    
    if (activeStep === 3) {
      if (!indicatorConfig) return false;

      // Junta as variáveis de cálculo e de contexto num array só
      const allAttributes = [
          ...indicatorConfig.calculationAttributes,
          ...indicatorConfig.contextAttributes
      ];

      // Filtra APENAS as que o Java marcou como "required: true"
      const requiredAttributes = allAttributes.filter(attr => attr.required === true);

      // Verifica se todas as obrigatórias foram mapeadas
      const isValid = requiredAttributes.every(attr => {
          const mapping = columnMappings[attr.id];
          return mapping && mapping.excelColumn && mapping.excelColumn !== "";
      });

      return isValid;
    }
    return true; 
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="text.primary" fontWeight="bold">
          Adicionar dados
        </Typography>
      </Box>

      <Box ref={stepContainerRef}  sx={{ width: "100%", mb: 5 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Paper elevation={0} sx={{ p: 4, minHeight: "50vh", border: "1px solid #E0E0E0" }}>
        
        {activeStep === 0 && <Step0Upload file={file} setFile={handleFileChange} />}

        {activeStep === 1 && <Step1Indicator selectedIndicator={indicatorId} setIndicator={setIndicatorId} />}

        {activeStep === 2 && (
          <Step2ConfirmTitle 
            previewMatrix={previewMatrix} 
            totalRows={totalRows}
            onConfirm={handleConfirmHeaders} 
          />
        )}

        {activeStep === 3 && (
          <Step3MapColumns 
            mappings={columnMappings} 
            setMappings={setColumnMappings} 
            fileColumns={fileColumns} 
            indicatorId={indicatorId} 
          />
        )}

        {activeStep === 4 && <Step4Review 
             file={file}
             indicatorId={indicatorId}
             mappings={columnMappings}
             fileColumns={fileColumns}
             previewMatrix={previewMatrix}
        />}
        
        {activeStep === 5 && (
            <Box textAlign="center" py={8} display="flex" flexDirection="column" alignItems="center">
                <CheckCircleOutlineIcon sx={{ fontSize: 120, color: "success.main", mb: 3 }} />
                <Typography variant="h4" color="text.primary" fontWeight="bold" gutterBottom>
                    Dados enviados com sucesso!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
                    O arquivo foi processado e os indicadores foram atualizados no sistema.
                </Typography>
                
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" size="large" onClick={() => router.push("/home")}>
                        Voltar para Home
                    </Button>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={() => router.push("/meus-envios/historico")}
                        sx={{ bgcolor: "success.main", '&:hover': { bgcolor: "success.dark" } }}
                    >
                        Ver Histórico de Envios
                    </Button>
                </Stack>
            </Box>
        )}

      </Paper>

      {activeStep < 5 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            
            <Button 
                onClick={handleBack} 
                variant="outlined" 
                size="large"
                disabled={isUploading}
                sx={{ px: 4, fontWeight: "bold", textTransform: "none" }}
            >
             Voltar
            </Button>
            
            {activeStep !== 2 && (
                <Button 
                    variant="contained" 
                    onClick={handleNext}
                    disabled={!isStepValid() || isUploading}
                    size="large"
                    sx={{ 
                        px: 4, 
                        bgcolor: "primary.main", 
                        fontWeight: "bold", 
                        textTransform: "none",
                        minWidth: 150 
                    }}
                >
                 {isUploading ? <CircularProgress size={24} color="inherit" /> : (activeStep === steps.length - 1 ? "Enviar Dados" : "Continuar")}
                </Button>
            )}
        </Box>
      )}
    </Container>
  );
}