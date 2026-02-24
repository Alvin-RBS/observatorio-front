export type StatusEnvio = "Pendente" | "Processando" | "Concluído" | "Erro";

export interface ErroProcessamento {
  linha: string | number;
  descricao: string;
}

export interface MeuEnvioItem {
  id: number;
  dataHora: string;
  arquivoNome: string;
  tipoAcao: string;
  status: StatusEnvio;
  linhasProcessadas: number;
  registrosCriados: number;
  erros?: ErroProcessamento[];
}

// Simulando apenas os envios do usuário logado (ex: Alberto)
export const MOCK_MEUS_ENVIOS: MeuEnvioItem[] = [
  {
    id: 201,
    dataHora: "23/02/2026 às 14:30",
    arquivoNome: "dados_violencia_jan2026.xlsx",
    tipoAcao: "Importação de Planilha",
    status: "Concluído",
    linhasProcessadas: 1540,
    registrosCriados: 1540,
  },
  {
    id: 202,
    dataHora: "20/02/2026 às 10:15",
    arquivoNome: "vitimas_saude_fev.csv",
    tipoAcao: "Importação de Planilha",
    status: "Erro",
    linhasProcessadas: 850,
    registrosCriados: 845,
    erros: [
      { linha: 45, descricao: "Valor inválido no campo 'Idade' (Texto encontrado, esperado Número)." },
      { linha: 112, descricao: "CPF duplicado no sistema." }
    ]
  },
  {
    id: 203,
    dataHora: "23/02/2026 às 16:00",
    arquivoNome: "dados_educacao_q1.xlsx",
    tipoAcao: "Importação de Planilha",
    status: "Pendente",
    linhasProcessadas: 0,
    registrosCriados: 0,
  },
  {
    id: 204,
    dataHora: "23/02/2026 às 16:05",
    arquivoNome: "relatorio_parcial.xlsx",
    tipoAcao: "Importação de Planilha",
    status: "Processando",
    linhasProcessadas: 400,
    registrosCriados: 0,
  }
];

export const getStatusConfig = (status: StatusEnvio) => {
  switch (status) {
    case "Concluído":
      return { label: "Concluído", color: "#D1FAE5", textColor: "#065F46" }; 
    case "Erro":
      return { label: "Erro", color: "#FEE2E2", textColor: "#991B1B" }; 
    case "Processando":
      return { label: "Processando", color: "#DBEAFE", textColor: "#1E40AF" }; 
    case "Pendente":
      return { label: "Pendente", color: "#FEF3C7", textColor: "#92400E" }; 
    default:
      return { label: status, color: "#F3F4F6", textColor: "#374151" };
  }
};