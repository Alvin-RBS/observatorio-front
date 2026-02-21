import { useState } from "react";
import { ChartType } from "@/context/DashboardContext";

export interface ChartDraft {
  type: ChartType | null;
  config: {
    xAxisAttribute?: string; 
    selectedValues?: string[]; 
    yAxisAttribute?: string;
    secondaryAttribute?: string; // Ex: 'municipio' (quando eixo X é 'arma')
    secondaryValues?: string[];  // Ex: ['Recife', 'Olinda']
    startYear?: number;
    endYear?: number;
  };
  title: string;
}

export function useChartCreation() {
  const [activeStep, setActiveStep] = useState(0);
  const [draft, setDraft] = useState<ChartDraft>({
    type: null,
    config: {}, // O objeto começa vazio, mas agora aceita startYear/endYear
    title: ""
  });

  const nextStep = () => setActiveStep((prev) => prev + 1);
  const prevStep = () => setActiveStep((prev) => prev - 1);
  
  const updateDraft = (updates: Partial<ChartDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const updateConfig = (configUpdates: Partial<ChartDraft['config']>) => {
    setDraft(prev => ({ ...prev, config: { ...prev.config, ...configUpdates } }));
  };

  const reset = () => {
    setActiveStep(0);
    setDraft({ type: null, config: {}, title: "" });
  };

  return {
    activeStep,
    draft,
    nextStep,
    prevStep,
    updateDraft,
    updateConfig,
    reset
  };
}