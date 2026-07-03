import { apiClient } from "../api-client";
import {
  DockerContainer,
  DockerStats,
  ContainerAction,
} from "@devforge/devops-hub";

export type {
  DockerContainer,
  DockerStats,
  ContainerAction,
};

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
