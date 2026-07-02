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

export interface ControlContainerDto {
  action: ContainerAction;
}
