import { apiFetch } from '@/service/api';
import { LoginData, LoginResponse } from '../types/login';

export async function login(data: LoginData): Promise<LoginResponse> {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
