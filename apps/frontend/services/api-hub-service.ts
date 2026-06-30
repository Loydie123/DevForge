import { API_BASE_URL } from "../config/env";

export interface SavedRequest {
  id: string;
  collectionId: string;
  name: string;
  method: string;
  url: string;
  headers: string;
  body?: string;
}

export interface Collection {
  id: string;
  projectId: string;
  name: string;
  requests?: SavedRequest[];
}

export interface HistoryItem {
  id: string;
  projectId: string;
  method: string;
  url: string;
  headers: string;
  body?: string;
  timestamp: string;
}

export interface ExecuteRequestDto {
  projectId: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface SaveRequestDto {
  collectionId: string;
  name: string;
  method: string;
  url: string;
  headers: string; // JSON string representing headers
  body?: string;
}

export const apiHubService = {
  async execute(dto: ExecuteRequestDto, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to execute request.");
    }
    return data;
  },

  async getCollections(projectId: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/collections/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch collections.");
    }
    return data;
  },

  async createCollection(projectId: string, name: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ projectId, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create collection.");
    }
    return data;
  },

  async deleteCollection(projectId: string, id: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/collections/${projectId}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to delete collection.");
    }
    return data;
  },

  async saveRequest(dto: SaveRequestDto, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to save request.");
    }
    return data;
  },

  async updateRequest(id: string, dto: Partial<SaveRequestDto>, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update request.");
    }
    return data;
  },

  async deleteRequest(id: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/requests/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to delete request.");
    }
    return data;
  },

  async getHistory(projectId: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/history/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch history.");
    }
    return data;
  },

  async clearHistory(projectId: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/api-hub/history/clear/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to clear history.");
    }
    return data;
  }
};
