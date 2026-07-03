import { apiClient } from "../api-client";
import { DEFAULT_PROJECT_ID } from "../../config/env";

export const apiService = {
  async triggerMockEvent() {
    const res = await apiClient.get<unknown>("/trigger-mock");
    return res.data;
  },

  async executeApiHubRequest() {
    const res = await apiClient.post<unknown>("/api-hub/execute", {
      projectId: DEFAULT_PROJECT_ID,
      method: "GET",
      url: "https://httpbin.org/delay/1",
      headers: { Accept: "application/json" },
    });
    return res.data;
  }
};
