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

// 추론 요청 실패. status가 없으면 네트워크 실패
export class VisualizeError extends Error {
  readonly status: number | null;

  constructor(status: number | null) {
    super(status === null ? 'Network error' : `Visualize request failed: ${status}`);
    this.name = 'VisualizeError';
    this.status = status;
  }
}

// 상태 코드별 표시 문구. 5xx 본문은 서버 고정 문구라 사용하지 않는다
export const getVisualizeErrorMessage = (error: unknown): string => {
  const status = error instanceof VisualizeError ? error.status : null;
  switch (status) {
    case null:
      return 'Could not reach the server. Please check your connection and try again.';
    case 400:
      return 'The input was rejected. Please check the text and try again.';
    case 413:
      return 'The input is too long. Please shorten the text.';
    case 429:
      return 'The model is busy with another request. Please try again shortly.';
    case 502:
      return 'Could not connect to the model server. Please try again later.';
    case 503:
      return 'The visualizer service is not available right now.';
    case 504:
      return 'The model server timed out. Please try again.';
    default:
      return 'Failed to fetch output.';
  }
};

export const visualizeApi = {
  /**
   * 모델 추론을 수행하고 토큰 벡터 데이터를 반환합니다.
   * @param inputText 입력 텍스트
   * @returns 토큰화된 결과 및 벡터 정보
   */
  async getTokenVectors(inputText: string): Promise<VisualizeResponse> {
    try {
      const requestUrl = `${API_BASE_URL}${API_PREFIX}/visualize`;

      // credentials 없이 보낸다 (쿠키가 실리면 서버가 CSRF를 요구해 403이 된다).
      // 클라이언트 시간 제한은 두지 않는다 (서버 프록시 30초보다 짧으면 안 됨)
      let response: Response;
      try {
        response = await fetch(requestUrl, {
          method: 'POST',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input_text: inputText } as VisualizeRequest),
        });
      } catch {
        throw new VisualizeError(null);
      }

      if (!response.ok) {
        throw new VisualizeError(response.status);
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

export class FeedbackRateLimitError extends Error {
  constructor() {
    super('Too many requests');
    this.name = 'FeedbackRateLimitError';
  }
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
      
      // api.jace-s.com은 /api 없이 쓴다
      const requestUrl = `${API_BASE_URL}/comments`;
      // console.log('[API] Feedback Request URL:', requestUrl);
      // console.log('[API] API_BASE_URL:', API_BASE_URL);

      const response = await fetch(requestUrl, {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Retry-After는 다른 Origin에서 읽을 수 없으므로 고정 안내 문구를 쓴다
      if (response.status === 429) {
        throw new FeedbackRateLimitError();
      }

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

