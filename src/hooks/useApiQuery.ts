import { APIError } from "@/error/type";
import { useCallback, useEffect, useState, DependencyList } from "react";

export function useApiQuery<TResponse>(
  fetchFunction: () => Promise<TResponse>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFunction();
      setData(result);
      setError(null); 
    } catch (err) {
      setError(err as APIError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
