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
    id: "cvli",
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
    id: "feminicidio",
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
    id: "3", // Mantive o ID original da sua lista
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

  // ===============================
  // NOVOS INDICADORES ADICIONADOS
  // ===============================

  // EXEMPLO 4: Mortes por Armas de Fogo (Número Absoluto)
  {
    id: "MORTES_ARMAS_FOGO",
    label: "Mortes por Armas de Fogo",
    type: 'ABSOLUTE',
    calculationAttributes: [
      COMMON_ATTRS.municipio,
      { id: 'total_mortes', label: 'Total de Mortes por Arma de Fogo', dataType: 'number' }
    ],
    contextAttributes: [
      COMMON_ATTRS.data, // Usando o COMMON para manter a compatibilidade com o calendário
      { id: 'bairro', label: 'Bairro', dataType: 'text' },
      { id: 'sexo', label: 'Sexo da Vítima', dataType: 'text' },
      { id: 'faixa_etaria', label: 'Faixa Etária', dataType: 'text' }
    ]
  },

  // EXEMPLO 5: Crimes contra a propriedade (Taxa por 100k habitantes)
  {
    id: "CRIMES_CONTRA_PROPRIEDADE",
    label: "Crimes contra a propriedade (CVP)",
    type: 'RATE',
    multiplier: 100000,
    calculationAttributes: [
      COMMON_ATTRS.municipio,
      { id: 'total_crimes_propriedade', label: 'Total de Crimes contra a Propriedade', dataType: 'number' },
      { id: 'populacao', label: 'População', dataType: 'number' }
    ],
    contextAttributes: [
      COMMON_ATTRS.ano, // Usando o COMMON para manter a compatibilidade com a linha do tempo
      { id: 'tipo_crime', label: 'Tipo de Crime', dataType: 'text' }
    ]
  }
];

export const getIndicatorConfig = (id: string): IndicatorConfig | undefined => {
  return INDICATORS_DB.find(ind => ind.id === id);
};
