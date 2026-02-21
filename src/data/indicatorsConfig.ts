// src/data/indicatorsConfig.ts

export type IndicatorType = 'ABSOLUTE' | 'RATE';

export type AttributeDataType = 'text' | 'number' | 'date';

export interface IndicatorAttribute {
  id: string;           
  label: string;        
  dataType: AttributeDataType; 
}

export interface IndicatorConfig {
  id: string;
  label: string;
  type: IndicatorType;
  multiplier?: number; 
  calculationAttributes: IndicatorAttribute[];
  contextAttributes: IndicatorAttribute[];
}

// --- ATRIBUTOS COMUNS ---

const COMMON_ATTRS = {
  municipio: { id: 'municipio', label: 'Município', dataType: 'text' as AttributeDataType },
  ano: { id: 'ano', label: 'Ano', dataType: 'number' as AttributeDataType },
  data: { id: 'data', label: 'Data da Ocorrência', dataType: 'date' as AttributeDataType },
};


export const INDICATORS_DB: IndicatorConfig[] = [
  // EXEMPLO 1: CVLI (Taxa por 100k habitantes)
  {
    id: "1",
    label: "Crimes Violentos Letais Intencionais (CVLI)",
    type: 'RATE',
    multiplier: 100000,
    calculationAttributes: [
      COMMON_ATTRS.municipio, 
      { id: 'total_vitimas', label: 'Total de Vítimas', dataType: 'number' } 
    ],
    contextAttributes: [
      COMMON_ATTRS.data,
      COMMON_ATTRS.ano,
      { id: 'sexo', label: 'Sexo', dataType: 'text' },
      { id: 'idade', label: 'Idade', dataType: 'number' },
      { id: 'natureza_juridica', label: 'Natureza Jurídica', dataType: 'text' }
    ]
  },

  // EXEMPLO 2: Feminicídio (Taxa por 100k mulheres)
  {
    id: "2",
    label: "Feminicídio",
    type: 'RATE',
    multiplier: 100000,
    calculationAttributes: [
      COMMON_ATTRS.municipio,
      { id: 'total_ocorrencias', label: 'Total de Ocorrências', dataType: 'number' }
    ],
    contextAttributes: [
      COMMON_ATTRS.data,
      COMMON_ATTRS.ano,
      { id: 'idade', label: 'Idade', dataType: 'number' },
      { id: 'bairro', label: 'Bairro', dataType: 'text' }
    ]
  },

  // EXEMPLO 3: Apreensão de Armas (Número Absoluto)
  {
    id: "3",
    label: "Apreensão de Armas de Fogo",
    type: 'ABSOLUTE',
    calculationAttributes: [
      COMMON_ATTRS.municipio,
      { id: 'qtd_armas', label: 'Quantidade Apreendida', dataType: 'number' }
    ],
    contextAttributes: [
      COMMON_ATTRS.data,
      COMMON_ATTRS.ano,
      { id: 'tipo_arma', label: 'Tipo de Arma ', dataType: 'text' },
      { id: 'calibre', label: 'Calibre', dataType: 'text' }
    ]
  },
  
  // EXEMPLO 4: Roubo a Transeunte (Absoluto)
  {
    id: "4",
    label: "Roubo a Transeunte",
    type: 'ABSOLUTE',
    calculationAttributes: [
        COMMON_ATTRS.municipio,
        { id: 'total_roubos', label: 'Total de Roubos', dataType: 'number' }
    ],
    contextAttributes: [
        COMMON_ATTRS.data,
        COMMON_ATTRS.ano,
        { id: 'horario', label: 'Horário do Fato', dataType: 'text' },
        { id: 'bairro', label: 'Bairro', dataType: 'text' }
    ]
  },

   {
    id: "5",
    label: "Homicídios de 18 a 29 anos",
    type: 'ABSOLUTE',
    calculationAttributes: [
      { id: 'total_ocorrencias', label: 'Total de Ocorrências', dataType: 'number' } 
    ],
    contextAttributes: [
      COMMON_ATTRS.data,
      COMMON_ATTRS.ano,
      { id: 'sexo', label: 'Sexo', dataType: 'text' },
      { id: 'idade', label: 'Idade', dataType: 'number' },
      { id: 'natureza_juridica', label: 'Natureza Jurídica', dataType: 'text' }
    ]
  }
];

export const getIndicatorConfig = (id: string): IndicatorConfig | undefined => {
  return INDICATORS_DB.find(ind => ind.id === id);
};