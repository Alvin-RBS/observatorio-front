// mockRelatorios.ts

export const MUNICIPIOS = ["Recife", "Olinda", "Jaboatão dos Guararapes", "Paulista", "Camaragibe"];
export const REGIOES = ["Região Metropolitana do Recife (RMR)", "Agreste", "Sertão", "Zona da Mata"];
export const NATUREZAS_JURIDICAS = ["Violência Doméstica", "Homicídio", "Roubo/Furto", "Lesão Corporal", "Crimes Cibernéticos"];
export const FAIXAS_ETARIAS = ["0 a 17 anos", "18 a 29 anos", "30 a 59 anos", "60 anos ou mais"];
export const SEXO = ["Feminino", "Masculino", "Outros", "Não informado"];

export interface GraficoDisponivel {
  id: string;
  titulo: string;
  tipo: "Barra" | "Pizza" | "Linha" | "Mapa";
  indicador: string;
}

export const GRAFICOS_MOCK: GraficoDisponivel[] = [
  { id: "g1", titulo: "Ocorrências por Bairro", tipo: "Barra", indicador: "Geral" },
  { id: "g2", titulo: "Perfil de Gênero das Vítimas", tipo: "Pizza", indicador: "Geral" },
  { id: "g3", titulo: "Evolução Temporal de Homicídios", tipo: "Linha", indicador: "Letalidade" },
  { id: "g4", titulo: "Mapa de Calor de Roubos", tipo: "Mapa", indicador: "Patrimonial" },
  { id: "g5", titulo: "Faixa Etária - Violência Doméstica", tipo: "Barra", indicador: "Violência Doméstica" }
];