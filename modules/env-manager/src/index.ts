export type EnvType = 'development' | 'staging' | 'production';
export type SecretType = 'plain' | 'secret' | 'api_key' | 'connection_string';

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  type: SecretType;
  masked: boolean;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EnvConfig {
  id: string;
  name: string;
  environment: EnvType;
  variables: EnvVariable[];
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface EnvVersion {
  id: string;
  configId: string;
  version: number;
  snapshot: EnvVariable[];
  changedBy: string;
  changedAt: number;
  note?: string;
}

export interface EnvStats {
  totalConfigs: number;
  totalVariables: number;
  totalSecrets: number;
  totalVersions: number;
  byEnvironment: Record<EnvType, number>;
}
