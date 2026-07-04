export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RecordErrorDto {
  projectId: string;
  service: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
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

export interface ErrorStats {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byService: Record<string, number>;
  recentCount: number;
}
