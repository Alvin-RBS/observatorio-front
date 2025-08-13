// hooks/useLogin.ts
import { useMemo } from "react";
import { useApiMutation } from "@/hooks/useApiMutation"; 
import { login } from "../services/loginService";
import { LoginData, LoginResponse } from "../types/login";
import { APIError } from "@/error/type";

export function useLogin() {
  const { execute, loading, error, data } = useApiMutation<LoginData, LoginResponse>(login);

  const uiMessage = useMemo(() => {
    if (!error) return null;

    const err = error as APIError;
    if (err.statusCode === 401) return "Usuário ou senha inválidos";
    return err.title ? `${err.title}: ${err.message}` : `Erro inesperado: ${err.message}`;
  }, [error]);

  async function doLogin(credentials: LoginData): Promise<LoginResponse | null> {
    const res = await execute(credentials);
    if (res) {
      localStorage.setItem("userData", JSON.stringify(res));
    }
    return res;
  }

  return { doLogin, loading, error: uiMessage, data };
}
