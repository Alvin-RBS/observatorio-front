import { ErrorAPI } from '../utils/error/type';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const userDataRaw = localStorage.getItem("userData");
  if (!userDataRaw) return null;

  try {
    const userData = JSON.parse(userDataRaw) as { access_token?: string };
    return userData?.access_token || null;
  } catch (err) {
    console.warn("Erro ao ler access_token:", err);
    return null;
  }
}

function updateAccessToken(token: string) {
  if (typeof window === "undefined") return;

  const userDataRaw = localStorage.getItem("userData");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
  userData.access_token = token;
  localStorage.setItem("userData", JSON.stringify(userData));
}

export async function tryRefreshToken(): Promise<boolean> {
  try {
    console.log("🔁 Tentando renovar o token de acesso...");
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    console.log("✅ Token renovado com sucesso.");
    const data = await res.json();

    if (data?.access_token) {
      updateAccessToken(data.access_token);
      return true;
    }

    return false;
  } catch (err) {
    console.error("Erro ao tentar renovar o token:", err);
    return false;
  }
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userData");
    window.location.href = "/login";
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  onUnauthorized?: () => void
) {
  if (typeof window === "undefined") {
    console.warn(`[apiFetch] chamada ignorada no SSR: ${endpoint}`);
    return {};
  }

  const accessToken = getAccessToken();

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && accessToken) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newAccessToken = getAccessToken();
      if (newAccessToken) {
        headers["Authorization"] = `Bearer ${newAccessToken}`;
        res = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
      } else {
        console.warn("Token de acesso não encontrado após refresh.");
        redirectToLogin();
      }
    } else {
      console.warn("Falha ao renovar o token. Redirecionando para login.");
      redirectToLogin();
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      onUnauthorized?.();
    }

    let errorBody: Partial<{ message?: string; title?: string }> = {};
    let message = "Erro inesperado.";

    try {
      errorBody = await res.clone().json();
      if (errorBody?.message) message = errorBody.message;
    } catch {
      try {
        const fallbackText = await res.text();
        if (fallbackText) {
          console.warn("HTML retornado pelo servidor:", fallbackText);
          message = "Erro interno no servidor.";
        }
      } catch (textError) {
        console.warn("Falha ao ler resposta:", textError);
      }
    }

    throw new ErrorAPI(message, res.status, errorBody?.title || undefined);
  }

  return res.json().catch(() => ({}));
}
