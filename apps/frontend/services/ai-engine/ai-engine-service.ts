import { apiClient } from "../api-client";
import { AiRequestDto, AiResponseDto } from "@devforge/ai-engine";

class AiEngineService {
  /**
   * Sends code context, prompt, provider, and private key to backend.
   */
  async chat(payload: AiRequestDto): Promise<AiResponseDto> {
    const response = await apiClient.post<AiResponseDto>("/ai-engine/chat", payload);
    return response.data;
  }
}

export const aiEngineService = new AiEngineService();
export default aiEngineService;
