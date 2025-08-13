import { useState } from "react";
import { APIError } from "@/error/type";

export function useApiMutation<TRequest, TResponse>(
  apiCall: (data: TRequest) => Promise<TResponse>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
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
      let apiError: APIError;

      if (err && typeof err === "object" && "message" in err) {
        apiError = {
          name: (err as Error).name || "APIError",
          message: (err as Error).message,
          statusCode: (err as APIError).statusCode,
          title: (err as APIError).title,
        };
      } else {
        apiError = {
          name: "APIError",
          message: String(err),
        };
      }

      setError(apiError);
      setData(null);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }

  return { execute, loading, error, data };
}
