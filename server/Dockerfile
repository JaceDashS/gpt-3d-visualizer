FROM python:3.11-slim

WORKDIR /app

# 빌드 의존성 (llama-cpp-python 빌드용)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ build-essential \
    cmake \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 빌드 도구 제거(선택: 문제 생기면 일단 제거하지 말고 디버깅)
RUN apt-get purge -y gcc g++ build-essential cmake \
    && apt-get autoremove -y \
    && apt-get clean

# 모델 디렉토리 생성
RUN mkdir -p models

# config.py를 먼저 복사 (model.py가 config를 import하므로 필요)
COPY config.py .

# 모델 다운로드를 위해 model.py 복사 (다운로드 함수 사용)
COPY model.py .

# 모델 파일 복사 (빌드 타임에 다운로드된 모델이 있으면 사용)
# GitHub Actions나 로컬에서 빌드 전에 download_model.py를 실행하면
# models/ 폴더에 모델이 있어서 COPY로 포함됨
COPY models/ ./models/

# 모델이 없으면 빌드 타임에 다운로드 (fallback)
# models/ 폴더가 비어있거나 모델이 없을 경우에만 실행
RUN if [ ! -f models/Llama-3.2-1B-Instruct-Q4_K_M.gguf ]; then \
        echo "모델이 없어서 다운로드합니다..."; \
        python -c "from model import download_model_from_hf; download_model_from_hf()"; \
        python -c "from datetime import datetime; open('models/.model_built_at', 'w').write(datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'))"; \
    else \
        echo "모델이 이미 존재합니다. 다운로드를 스킵합니다."; \
        python -c "from datetime import datetime; open('models/.model_built_at', 'w').write(datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'))"; \
    fi

# 나머지 서버 코드 복사
COPY main.py .
COPY routes.py .
COPY utils.py .
COPY schemas.py .

# 도커 포트 설정
# Cloud Run은 PORT 환경 변수를 자동으로 설정하므로 EXPOSE만 설정
EXPOSE 8080
ENV SERVER_HOST=0.0.0.0
# PORT 환경 변수가 없을 경우를 위한 기본값 (Cloud Run에서는 PORT가 자동 설정됨)
ENV SERVER_PORT=8080

# 모델 스레드 설정 (도커 환경에서는 1스레드 사용)
ENV LLAMA_N_THREADS=1

# Python 기본 HTTP 서버 사용 (unbuffered 모드로 즉시 출력)
CMD ["python", "-u", "main.py"]
