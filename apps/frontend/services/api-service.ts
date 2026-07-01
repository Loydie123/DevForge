import { apiClient } from "./api-client";

export const apiService = {
  async triggerMockEvent() {
    const res = await apiClient.get<unknown>("/trigger-mock");
    return res.data;
  },

  async executeApiHubRequest() {
    const res = await apiClient.post<unknown>("/api-hub/execute", {
      projectId: "00000000-0000-0000-0000-000000000000",
      method: "GET",
      url: "https://httpbin.org/delay/1",
      headers: { Accept: "application/json" },
    });
    return res.data;
  }
};
