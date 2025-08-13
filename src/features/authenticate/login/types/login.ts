export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string; 
  token_type: string;
  expires_in: number;

  user_id: number;
  email: string;
  name: string;
  tenant_id: number | null;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;

  redirect_url?: string;
}
