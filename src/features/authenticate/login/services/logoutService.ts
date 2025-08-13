import { apiFetch } from "@/service/api";


export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout", {
      method: "POST",
    });
  } catch (err) {
    console.error("Erro ao chamar logout no backend:", err);
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("userData");
    window.location.href = "/login";
  }
}
