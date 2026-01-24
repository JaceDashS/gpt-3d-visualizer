import { API_BASE_URL, API_PREFIX } from '../config/api';

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
      const requestUrl = `${API_BASE_URL}${API_PREFIX}/visualize`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input_text: inputText } as VisualizeRequest),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = (await response.json()) as VisualizeResponse;
      return data;
    } catch (error) {
      console.error('Error fetching output:', error);
      throw error;
    }
  },
};

// About 페이지 관련 API는 assetService.ts로 이동됨
// export interface AboutResponse ...
// export const aboutApi ...

// 코멘트/피드백 시스템 인터페이스
export interface CommentRequest {
  parentHeaderId: number | null;
  content: string;
  userPassword: string;
}

export interface CommentResponse {
  id: number;
}

export const feedbackApi = {
  /**
   * 피드백(코멘트)을 서버에 제출합니다.
   * IP는 서버에서 자동으로 추출되어 해싱됩니다.
   * @param comment 코멘트 데이터 (parentHeaderId는 null, content와 userPassword는 필수)
   * @returns 생성된 코멘트 ID
   */
  async submitFeedback(comment: { content: string; userPassword: string }): Promise<CommentResponse> {
    try {
      const requestBody: CommentRequest = {
        parentHeaderId: null, // 최상위 코멘트이므로 null
        content: comment.content,
        userPassword: comment.userPassword,
      };
      
      const requestUrl = `${API_BASE_URL}/api/comments`;
      // console.log('[API] Feedback Request URL:', requestUrl);
      // console.log('[API] API_BASE_URL:', API_BASE_URL);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to submit feedback: ${response.status}`
        );
      }

      const data = (await response.json()) as CommentResponse;
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
};

