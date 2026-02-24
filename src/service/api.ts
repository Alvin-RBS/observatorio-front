import axios from "axios";
import { ChartConfig } from "@/context/DashboardContext";

// Deixe vazio ("") para usar o domínio atual (Vercel) e cair no proxy do next.config.js
const BASE_URL = ""; 

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  //withCredentials: true, // Importante para cookies
});

/* --- 1. INTERCEPTOR DE REQUISIÇÃO (Injeta o Token) ---
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const userDataRaw = localStorage.getItem("userData");
      if (userDataRaw) {
        try {
          const userData = JSON.parse(userDataRaw);
          const token = userData?.access_token;
          
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

// --- 2. INTERCEPTOR DE RESPOSTA (Renova o Token) ---
apiClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Token expirado. Tentando renovar...");
        
        // Cuidado aqui: Se a rota de refresh for no backend da AWS, lembre-se de usar o proxy /api-backend/
        const response = await axios.post("/api-backend/api/v1/auth/refresh-token", {}, {
            withCredentials: true 
        });

        const { access_token } = response.data;

        const userDataRaw = localStorage.getItem("userData");
        const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
        userData.access_token = access_token;
        localStorage.setItem("userData", JSON.stringify(userData));

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error("❌ Sessão expirada. Faça login novamente.");
        
        if (typeof window !== "undefined") {
            localStorage.removeItem("userData");
            window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
)*/

// --- 3. INTEGRAÇÃO REAL DOS GRÁFICOS ---
export const fetchFilteredCharts = async (
    indicatorId: string, 
    filters: Record<string, string>
): Promise<ChartConfig[]> => {
    
    // 1. Limpa os filtros que estiverem vazios
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value.trim() !== "") {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, string>);

    try {
        // 2. Chama a rota falsa da Vercel (que será redirecionada pelo next.config.js para a AWS)
        // O Axios pega o 'cleanFilters' e monta automaticamente: ?municipio=Recife&sexo=Feminino
        const response = await apiClient.get<ChartConfig[]>(
            `/api-backend/api/indicadores/${indicatorId}/graficos`, 
            { params: cleanFilters } 
        );

        // 3. O Axios já converte o JSON automaticamente, basta retornar o '.data'
        return response.data;

    } catch (error) {
        console.error(`Falha ao buscar gráficos do indicador ${indicatorId}:`, error);
        throw error;
    }
};