import { apiClient } from "./api-client";
import { UserProfile, AuthResponse } from "@devforge/auth";

export type { UserProfile, AuthResponse };

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", { name, email, password });
    return res.data;
  },

  async getProfile(token?: string): Promise<UserProfile> {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await apiClient.get<UserProfile>("/auth/me", { headers });
    return res.data;
  }
};
