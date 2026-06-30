import { API_BASE_URL } from "../config/env";

export const apiService = {
  async triggerMockEvent() {
    const res = await fetch(`${API_BASE_URL}/trigger-mock`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to trigger mock event.");
    }
    return data;
  },

  async executeApiHubRequest(token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        projectId: "00000000-0000-0000-0000-000000000000",
        method: "GET",
        url: "https://httpbin.org/delay/1",
        headers: { Accept: "application/json" },
      }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to execute request.");
    }
    return data;
  }
};
