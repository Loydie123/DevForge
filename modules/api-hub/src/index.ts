export interface SavedRequest {
  id: string;
  collectionId: string;
  name: string;
  method: string;
  url: string;
  headers: string; // JSON string representing headers
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
  headers: string; // JSON string representing headers
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

export interface RequestExecutionResult {
  status: number;
  latencyMs: number;
  sizeBytes?: number;
  body: unknown;
  headers?: Record<string, string>;
}

export interface SaveRequestDto {
  collectionId: string;
  name: string;
  method: string;
  url: string;
  headers: string; // JSON string representing headers
  body?: string;
}
