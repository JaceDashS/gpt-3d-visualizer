import { API_BASE_URL } from '../config/api';

export interface VisualizeRequest {
  input_text: string;
}

export interface TokenVector {
  token: string;
  destination: [number, number, number]; // 목적지 좌표 (시작점은 이전 벡터의 destination 또는 [0,0,0])
  is_input: boolean;
}

export interface VisualizeResponse {
  tokens: TokenVector[];
}

export const visualizeApi = {
  /**
   * 모델 추론을 수행하고 토큰 벡터 데이터를 반환합니다.
   * @param inputText 입력 텍스트
   * @returns 토큰화된 결과 및 벡터 정보
   */
  async getTokenVectors(inputText: string): Promise<VisualizeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/visualize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input_text: inputText } as VisualizeRequest),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json() as VisualizeResponse;
      return data;
    } catch (error) {
      console.error('Error fetching output:', error);
      throw error;
    }
  },
};

