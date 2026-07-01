import { apiClient } from "./api-client";

export interface DockerContainer {
  ID: string;
  Names: string;
  Image: string;
  State: string;
  Status: string;
  Ports: string;
}

export interface DockerStats {
  Container: string;
  Name: string;
  CPUPerc: string;
  MemUsage: string;
  MemPerc: string;
  NetIO: string;
  BlockIO: string;
}

export type ContainerAction = "start" | "stop" | "restart";

export const devopsHubService = {
  async getContainers(): Promise<DockerContainer[]> {
    const res = await apiClient.get<DockerContainer[]>("/devops/containers");
    return res.data;
  },

  async getContainerStats(id: string): Promise<DockerStats> {
    const res = await apiClient.get<DockerStats>(
      `/devops/containers/${id}/stats`
    );
    return res.data;
  },

  async controlContainer(
    id: string,
    action: ContainerAction
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/devops/containers/${id}/action`,
      { action }
    );
    return res.data;
  },
};
