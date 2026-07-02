export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  name?: string;
  role?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  email: string;
  role: string;
  name?: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
