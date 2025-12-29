#!/usr/bin/env python3
"""
모델 다운로드 스크립트
로컬에 모델을 다운로드하여 Docker 이미지에 포함시킵니다.
"""
import os
import sys
from pathlib import Path

# UnicodeEncodeError 방지
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

from huggingface_hub import hf_hub_download

# Hugging Face 모델 설정 (model.py와 동일)
HF_REPO_ID = "bartowski/Llama-3.2-1B-Instruct-GGUF"
HF_FILENAME = "Llama-3.2-1B-Instruct-Q4_K_M.gguf"
MODELS_DIR = Path(__file__).parent / "models"

def download_model():
    """모델을 로컬에 다운로드"""
    print(f"모델 다운로드 중: {HF_REPO_ID}/{HF_FILENAME}")
    print(f"저장 위치: {MODELS_DIR}")
    
    # models 디렉토리 생성
    MODELS_DIR.mkdir(exist_ok=True)
    
    # 이미 모델이 있으면 스킵
    model_path = MODELS_DIR / HF_FILENAME
    if model_path.exists():
        print(f"✓ 모델이 이미 존재합니다: {model_path}")
        return str(model_path)
    
    try:
        # local_dir을 사용하면 파일이 local_dir/filename 형태로 저장됨
        downloaded_path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=HF_FILENAME,
            local_dir=str(MODELS_DIR),
            local_dir_use_symlinks=False  # 실제 파일로 다운로드
        )
        
        # 실제 파일 경로 확인
        if model_path.exists():
            print(f"✓ 모델 다운로드 완료: {model_path}")
            return str(model_path)
        elif os.path.exists(downloaded_path):
            print(f"✓ 모델 다운로드 완료: {downloaded_path}")
            return downloaded_path
        else:
            raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {downloaded_path}")
    except Exception as e:
        print(f"✗ 모델 다운로드 실패: {e}")
        raise

if __name__ == "__main__":
    download_model()


