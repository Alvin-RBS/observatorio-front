export type UserStatus = "Ativa" | "Desativado" | "Pendente";

export interface UserItem {
  id: number;
  name: string;      
  email: string;     
  type: string;
  secretaria: string;
  status: UserStatus;
  createdAt: string;
  inactivatedAt: string | null;
  cpf: string;
  telefone: string;
}

export const MOCK_USERS: UserItem[] = [
  { id: 1, name: "Alberto Santos Alves", email: "alberto.santos@sjdh.com", cpf: "123.456.789-00", telefone: "(81) 91234-5678", type: "Operador", secretaria: "SJDH", status: "Ativa", createdAt: "02/02/2026", inactivatedAt: null },
  { id: 2, name: "Carlos Eduardo Silva", email: "carlos.silva@exemplo.com", cpf: "234.567.890-11", telefone: "(81) 92345-6789", type: "Gestor", secretaria: "SDS", status: "Desativado", createdAt: "15/01/2025", inactivatedAt: "10/02/2026" },
  { id: 3, name: "Mariana Souza", email: "mariana.souza@exemplo.com", cpf: "345.678.901-22", telefone: "(81) 93456-7890", type: "Operador", secretaria: "Saúde", status: "Pendente", createdAt: "12/02/2026", inactivatedAt: null },
  { id: 4, name: "Roberto Almeida", email: "roberto.almeida@exemplo.com", cpf: "456.789.012-33", telefone: "(81) 94567-8901", type: "Admin", secretaria: "Educação", status: "Ativa", createdAt: "20/11/2025", inactivatedAt: null },
  { id: 5, name: "Fernanda Lima", email: "fernanda.lima@exemplo.com", cpf: "567.890.123-44", telefone: "(81) 95678-9012", type: "Operador", secretaria: "SJDH", status: "Ativa", createdAt: "05/01/2026", inactivatedAt: null },
  { id: 6, name: "João Pedro Santos", email: "joao.pedro@exemplo.com", cpf: "678.901.234-55", telefone: "(81) 96789-0123", type: "Gestor", secretaria: "SDS", status: "Pendente", createdAt: "13/02/2026", inactivatedAt: null },
];

export const getStatusConfig = (status: UserStatus) => {
  switch (status) {
    case "Ativa":
      return { label: "Ativo", color: "#D1FAE5", textColor: "#065F46" }; 
    case "Desativado":
      return { label: "Desativado", color: "#FEE2E2", textColor: "#991B1B" }; 
    case "Pendente":
      return { label: "Pendente", color: "#FEF3C7", textColor: "#92400E" }; 
    default:
      return { label: status, color: "#F3F4F6", textColor: "#374151" };
  }
};