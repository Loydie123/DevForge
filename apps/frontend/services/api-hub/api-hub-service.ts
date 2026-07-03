import { apiClient } from "../api-client";
import {
  SavedRequest,
  Collection,
  HistoryItem,
  ExecuteRequestDto,
  RequestExecutionResult,
  SaveRequestDto,
} from "@devforge/api-hub";

export type {
  SavedRequest,
  Collection,
  HistoryItem,
  ExecuteRequestDto,
  RequestExecutionResult,
  SaveRequestDto,
};


export const apiHubService = {
  async execute(dto: ExecuteRequestDto): Promise<RequestExecutionResult> {
    const res = await apiClient.post<RequestExecutionResult>("/api-hub/execute", dto);
    return res.data;
  },

  async getCollections(projectId: string) {
    const res = await apiClient.get<Collection[]>(`/api-hub/collections/${projectId}`);
    return res.data;
  },

  async createCollection(projectId: string, name: string) {
    const res = await apiClient.post<Collection>("/api-hub/collections", { projectId, name });
    return res.data;
  },

  async deleteCollection(projectId: string, id: string) {
    const res = await apiClient.delete<void>(`/api-hub/collections/${projectId}/${id}`);
    return res.data;
  },

  async saveRequest(dto: SaveRequestDto) {
    const res = await apiClient.post<SavedRequest>("/api-hub/requests", dto);
    return res.data;
  },

  async updateRequest(id: string, dto: Partial<SaveRequestDto>) {
    const res = await apiClient.put<SavedRequest>(`/api-hub/requests/${id}`, dto);
    return res.data;
  },

  async deleteRequest(id: string) {
    const res = await apiClient.delete<void>(`/api-hub/requests/${id}`);
    return res.data;
  },

  async getHistory(projectId: string) {
    const res = await apiClient.get<HistoryItem[]>(`/api-hub/history/${projectId}`);
    return res.data;
  },

  async clearHistory(projectId: string) {
    const res = await apiClient.delete<void>(`/api-hub/history/clear/${projectId}`);
    return res.data;
  }
};
