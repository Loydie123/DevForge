import { apiClient } from "./api-client";

export const authService = {
  async login(email: string, password: string) {
    const res = await apiClient.post<{ token: string }>("/auth/login", { email, password });
    return res.data;
  },

  async register(name: string, email: string, password: string) {
    const res = await apiClient.post<{ token: string }>("/auth/register", { name, email, password });
    return res.data;
  },

  async getProfile(token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await apiClient.get<{ email: string; role: string; name?: string }>("/auth/me", { headers });
    return res.data;
  }
};
