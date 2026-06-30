import { API_BASE_URL } from "../config/env";

export const authService = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to log in.");
    }
    return data as { token: string };
  },

  async register(name: string, email: string, password: string, role: string) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to register.");
    }
    return data as { token: string };
  },

  async getProfile(token: string) {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch user profile.");
    }
    return data as { email: string; role: string; name?: string };
  }
};
