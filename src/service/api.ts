import axios from "axios";

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