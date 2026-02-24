export type StatusEnvio = "Pendente" | "Processando" | "Concluído" | "Erro";

export interface ErroProcessamento {
  linha: string | number;
  descricao: string;
}

export interface EnvioItem {
  id: number;
  dataHora: string;
  usuarioNome: string;
  usuarioId: number;
  arquivoNome: string;
  tipoAcao: string;
  status: StatusEnvio;
  linhasProcessadas: number;
  registrosCriados: number;
  ip: string;
  erros?: ErroProcessamento[];
}

export const MOCK_ENVIOS: EnvioItem[] = [
  {
    id: 101,
    dataHora: "23/02/2026 às 14:30",
    usuarioNome: "Alberto Santos Alves",
    usuarioId: 1,
    arquivoNome: "dados_violencia_jan2026.xlsx",
    tipoAcao: "Importação de Planilha",
    status: "Concluído",
    linhasProcessadas: 1540,
    registrosCriados: 1540,
    ip: "192.168.1.45"
  },
  {
    id: 102,
    dataHora: "23/02/2026 às 15:15",
    usuarioNome: "Carlos Eduardo Silva",
    usuarioId: 2,
    arquivoNome: "relatorio_sds_consolidado.pdf",
    tipoAcao: "Upload de Documento",
    status: "Processando",
    linhasProcessadas: 0,
    registrosCriados: 0,
    ip: "192.168.1.88"
  },
  {
    id: 103,
    dataHora: "22/02/2026 às 09:10",
    usuarioNome: "Mariana Souza",
    usuarioId: 3,
    arquivoNome: "vitimas_saude_fev.csv",
    tipoAcao: "Importação de Planilha",
    status: "Erro",
    linhasProcessadas: 850,
    registrosCriados: 845,
    ip: "10.0.0.12",
    erros: [
      { linha: 45, descricao: "Valor inválido no campo 'Idade' (Texto encontrado, esperado Número)." },
      { linha: 112, descricao: "CPF duplicado no sistema." },
      { linha: 304, descricao: "Campo obrigatório 'Bairro' em branco." },
      { linha: 851, descricao: "Formato de data de ocorrência inválido." }
    ]
  },
  {
    id: 104,
    dataHora: "23/02/2026 às 16:00",
    usuarioNome: "Roberto Almeida",
    usuarioId: 4,
    arquivoNome: "dados_educacao_q1.xlsx",
    tipoAcao: "Importação de Planilha",
    status: "Pendente",
    linhasProcessadas: 0,
    registrosCriados: 0,
    ip: "172.16.254.1"
  }
];

export const getEnvioStatusConfig = (status: StatusEnvio) => {
  switch (status) {
    case "Concluído":
      return { label: "Concluído", color: "#D1FAE5", textColor: "#065F46" }; 
    case "Erro":
      return { label: "Erro", color: "#FEE2E2", textColor: "#991B1B" }; 
    case "Processando":
      return { label: "Processando", color: "#DBEAFE", textColor: "#1E40AF" }; // Azul suave
    case "Pendente":
      return { label: "Pendente", color: "#FEF3C7", textColor: "#92400E" }; 
    default:
      return { label: status, color: "#F3F4F6", textColor: "#374151" };
  }
};