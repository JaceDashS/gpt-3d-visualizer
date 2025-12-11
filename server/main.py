from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    
    import random
    
    all_tokens = input_tokens + output_tokens
    tokens_data = []
    zero_length_indices = {0, 1, 5, 9, 10, 17, 18, 14}  # 엣지케이스를 위한 길이0의 인덱스
    
    for i, token in enumerate(all_tokens):
        # 길이가 0인 인덱스는 이전 토큰의 목적지와 동일한 위치로 설정
        if i in zero_length_indices:
            # 길이가 0인 벡터로 만들기위해 이전 토큰의 목적지와 동일한 위치
            if i == 0:
                destination = [0.0, 0.0, 0.0]
            else:
                destination = tokens_data[-1].destination.copy()
        else:
            # 목적지 좌표 생성 (랜덤)
            destination = [
                random.uniform(-3, 3),
                random.uniform(-3, 3),
                random.uniform(-3, 3)
            ]
        
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
        print(f"Token vectors:")
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
