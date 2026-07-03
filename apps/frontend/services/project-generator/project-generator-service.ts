import { apiClient } from "../api-client";
import { GenerateProjectPayload } from "@devforge/project-generator";

class ProjectGeneratorService {
  /**
   * Sends options to backend and downloads the generated project ZIP file.
   */
  async downloadProject(payload: GenerateProjectPayload): Promise<void> {
    const response = await apiClient.post(
      "/project-generator/generate",
      payload,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Clean filename from project name
    const filename = `${payload.name.toLowerCase().replace(/[^a-z0-9-_]/g, "-")}.zip`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const projectGeneratorService = new ProjectGeneratorService();
export default projectGeneratorService;
