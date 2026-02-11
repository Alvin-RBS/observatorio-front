import { useState } from "react";
import { ErrorAPI } from "../utils/error/type";

export function useApiMutation<TRequest, TResponse>(
  apiCall: (data: TRequest) => Promise<TResponse>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorAPI | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  async function execute(payload: TRequest): Promise<TResponse | null> {
    setLoading(true);
    setError(null);

    try {
      console.log("Executing API call with payload:", payload);
      const result = await apiCall(payload);
      console.log("API call result:", result);
      setData(result);
      return result;
    } catch (err: unknown) {
      let errorAPI: ErrorAPI;

      if (err && typeof err === "object" && "message" in err) {
        errorAPI = {
          name: (err as Error).name || "ErrorAPI",
          message: (err as Error).message,
          statusCode: (err as ErrorAPI).statusCode,
          title: (err as ErrorAPI).title,
        };
      } else {
        errorAPI = {
          name: "ErrorAPI",
          message: String(err),
          statusCode: 500,
          title: "Erro desconhecido",
        };
      }

      setError(errorAPI);
      setData(null);
      throw errorAPI;
    } finally {
      setLoading(false);
    }
  }

  return { execute, loading, error, data };
}
