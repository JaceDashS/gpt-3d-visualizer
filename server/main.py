from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.decomposition import PCA
from config import SERVER_HOST, SERVER_PORT, CORS_ORIGINS, API_VERSION, SERVICE_NAME

app = FastAPI(title=SERVICE_NAME, version=API_VERSION)


class VisualizeRequest(BaseModel):
    input_text: str


class TokenVector(BaseModel):
    token: str
    destination: list[float]  # [x, y, z] 목적지 좌표
    is_input: bool      # 입력 토큰인지 출력 토큰인지


class VisualizeResponse(BaseModel):
    tokens: list[TokenVector]  # 토큰과 벡터 정보가 함께 묶인 배열

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": API_VERSION
    }


@app.post("/api/visualize", response_model=VisualizeResponse)
async def visualize(request: VisualizeRequest):
    """Visualize endpoint - 현재는 임시로 하드코딩된 토큰 반환"""
    # TODO: 이후 실제 GPT 토큰화 및 임베딩 처리 구현 예정
    
    # 테스트용 입력 텍스트를 단어 단위로 분리
    # 아래의 코드는 테스트를 위한 코드이고 나중에는 gpt로 할거임
    import re
    input_tokens = []
    words = request.input_text.split()
    for word in words:
        match = re.match(r'(\w+)([.,!?;:])?', word)
        if match:
            input_tokens.append(match.group(1))
            if match.group(2):
                input_tokens.append(match.group(2))
        else:
            input_tokens.append(word)

    output_tokens = ["The", "cat", "sits", "on", "the", "mat", "and", "watches", "birds", "fly", "high", "in", "the", "sky", "."]
    
    # 임시: 20차원 벡터 생성 후 PCA로 3차원으로 축소
    # TODO: 실제 GPT 모델의 임베딩 벡터를 사용할 예정
    import random
    
    all_tokens = input_tokens + output_tokens
    zero_length_indices = {0, 1, 5, 9, 10, 17, 18, 14}  # 엣지케이스를 위한 길이0의 인덱스
    
    # 1단계: 각 토큰에 대해 20차원 벡터 생성
    high_dim_vectors = []
    for i, token in enumerate(all_tokens):
        if i in zero_length_indices:
            # 길이가 0인 벡터: 이전 벡터와 동일한 20차원 벡터 사용
            if i == 0:
                # 첫 번째 토큰인 경우 영벡터
                high_dim_vector = np.zeros(20)
            else:
                # 이전 토큰의 벡터와 동일
                high_dim_vector = high_dim_vectors[-1].copy()
        else:
            # 20차원 랜덤 벡터 생성
            high_dim_vector = np.random.uniform(-1, 1, 20)
        
        high_dim_vectors.append(high_dim_vector)
    
    # 2단계: PCA로 3차원으로 축소
    high_dim_array = np.array(high_dim_vectors)
    pca = PCA(n_components=3)
    low_dim_vectors = pca.fit_transform(high_dim_array)
    
    # 3단계: 3차원 벡터를 destination으로 변환
    tokens_data = []
    for i, token in enumerate(all_tokens):
        if i in zero_length_indices:
            # 길이가 0인 벡터: 이전 토큰의 destination과 동일
            if i == 0:
                destination = [0.0, 0.0, 0.0]
            else:
                destination = tokens_data[-1].destination.copy()
        else:
            # PCA로 축소된 3차원 벡터를 destination으로 사용
            destination = low_dim_vectors[i].tolist()
        
        # 토큰 벡터 정보 생성 (시작점은 클라이언트에서 추적)
        token_vector = TokenVector(
            token=token,
            destination=destination,
            is_input=i < len(input_tokens)
        )
        tokens_data.append(token_vector)
    
    # 벡터값 콘솔 출력 
    try:
        print("\n=== Vector Values Returned ===")
        print(f"Total tokens: {len(tokens_data)}")
        print(f"Input tokens: {input_tokens}")
        print(f"Output tokens: {output_tokens}")
        print("\n--- 20차원 벡터 (PCA 전) ---")
        for i, (token, high_dim_vec) in enumerate(zip(all_tokens, high_dim_vectors)):
            vec_str = ", ".join([f"{v:.3f}" for v in high_dim_vec])
            print(f"  {token} ({'input' if i < len(input_tokens) else 'output'}): [{vec_str}]")
        print("\n--- 3차원 벡터 (PCA 후) ---")
        for i, (token, low_dim_vec) in enumerate(zip(all_tokens, low_dim_vectors)):
            print(f"  {token} ({'input' if i < len(input_tokens) else 'output'}): "
                  f"[{low_dim_vec[0]:.3f}, {low_dim_vec[1]:.3f}, {low_dim_vec[2]:.3f}]")
        print("\n--- 최종 destination (길이 0 처리 후) ---")
        for tv in tokens_data:
            print(f"  {tv.token} ({'input' if tv.is_input else 'output'}): "
                  f"destination=[{tv.destination[0]:.3f}, {tv.destination[1]:.3f}, {tv.destination[2]:.3f}]")
        print("==============================\n")
    except Exception as e:
        pass
    
    return VisualizeResponse(tokens=tokens_data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT)
