export interface LogSourceDto {
  projectId: string;
  name: string;
  filePath: string;
}

export interface LogSource {
  id: string;
  projectId: string;
  name: string;
  filePath: string;
  createdAt: string;
}

export interface ErrorLogDto {
  projectId: string;
  service: string;
  message: string;
  stack?: string;
  severity: string;
}

export interface ErrorLog {
  id: string;
  projectId: string;
  service: string;
  message: string;
  stack: string | null;
  severity: string;
  createdAt: string;
}
