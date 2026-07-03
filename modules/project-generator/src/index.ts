export interface GeneratorFeatures {
  auth: boolean;
  database: boolean;
  docker: boolean;
}

export interface GenerateProjectPayload {
  name: string;
  framework: string;
  features: GeneratorFeatures;
}
