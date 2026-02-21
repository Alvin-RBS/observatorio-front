import axios from "axios";
import { ChartConfig } from "@/context/DashboardContext";

// Pega a URL do Gateway (via Rewrite do Next.js, então usamos caminho relativo)
// Se estiver rodando no servidor (SSR), precisa da URL completa, mas geralmente Axios roda no cliente aqui.
const BASE_URL = ""; 

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para cookies
});

// --- 1. INTERCEPTOR DE REQUISIÇÃO (Antes de enviar) ---
apiClient.interceptors.request.use(
  (config) => {
    // Tenta pegar o token do localStorage
    if (typeof window !== "undefined") {
      const userDataRaw = localStorage.getItem("userData");
      if (userDataRaw) {
        try {
          const userData = JSON.parse(userDataRaw);
          const token = userData?.access_token;
          
          // Se tiver token, injeta no cabeçalho
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error("Erro ao ler token do storage", e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. INTERCEPTOR DE RESPOSTA (Se der erro) ---
apiClient.interceptors.response.use(
  (response) => response, // Se deu certo, só passa
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (Não autorizado) e ainda não tentamos renovar...
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Token expirado. Tentando renovar...");
        
        // Chama a rota de refresh (ajuste a URL conforme seu backend)
        const response = await axios.post("/api/v1/auth/refresh-token", {}, {
            withCredentials: true // O Refresh Token geralmente vem via Cookie HttpOnly
        });

        const { access_token } = response.data;

        // Salva o novo token no localStorage
        const userDataRaw = localStorage.getItem("userData");
        const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
        userData.access_token = access_token;
        localStorage.setItem("userData", JSON.stringify(userData));

        // Atualiza o token na requisição que falhou e tenta de novo
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error("❌ Sessão expirada. Faça login novamente.");
        
        // Se falhar o refresh, desloga o usuário
        if (typeof window !== "undefined") {
            localStorage.removeItem("userData");
            window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- SIMULADOR DE API DO BACKEND ---
// Quando o Spring Boot estiver pronto, você vai deletar essa função.
export const fetchFilteredChartsMock = async (
    indicatorId: string, 
    filters: Record<string, string>, 
    baseCharts: ChartConfig[]
): Promise<ChartConfig[]> => {
    return new Promise((resolve) => {
        // Simula o delay de internet e banco de dados (600ms)
        setTimeout(() => {
            // Verifica se tem filtros ativos (ignorando as datas padrão para o mock não ficar sempre vazio)
            const hasActiveFilters = Object.entries(filters).some(
                ([key, value]) => value !== "" && key !== "inicio" && key !== "fim"
            );

            if (!hasActiveFilters) {
                resolve(baseCharts); // Retorna os dados cheios do banco
                return;
            }

            // MOCK: Reduz os valores apenas para provar que a "API" filtrou os dados
            const filteredData = baseCharts.map(chart => {
                const newSeries = JSON.parse(JSON.stringify(chart.series));
                if (chart.type === 'pie' || chart.type === 'donut') {
                    newSeries.forEach((val: number, i: number) => { newSeries[i] = Math.max(1, Math.floor(val * 0.4)); });
                } else if (chart.type === 'treemap' || chart.type === 'heatmap') {
                     newSeries.forEach((s: any) => { s.data.forEach((d: any) => { d.y = Math.max(1, Math.floor(d.y * 0.4)); }); });
                } else {
                    newSeries.forEach((s: any) => {
                        if (s.data) s.data = s.data.map((v: number) => Math.max(1, Math.floor(v * 0.4)));
                    });
                }
                return { ...chart, series: newSeries };
            });

            resolve(filteredData);
        }, 600);
    });
};