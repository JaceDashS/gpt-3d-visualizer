# 영어 스펠링 체크 시스템 제안서

## 1. 개요

코드베이스에서 영어 스펠링 오류를 자동으로 감지하는 간단한 시스템

## 2. 추천 도구: codespell

### 2.1. codespell 소개
- **설치**: `pip install codespell`
- **장점**:
  - 간단하고 빠름
  - Python, JavaScript, TypeScript, Markdown 등 다중 언어 지원
  - 일반적인 오타 패턴 자동 인식
  - 무료 오픈소스

### 2.2. 기본 사용법
```bash
# 전체 프로젝트 검사
codespell --skip="*.pyc,venv/*,node_modules/*,__pycache__/*"

# 특정 파일만 검사
codespell server/main.py client/src/**/*.ts
```

### 2.3. 설정 파일 (선택사항)
`.codespellrc` 파일 생성:
```
[options]
skip = *.pyc,venv/*,node_modules/*,__pycache__/*,*.pyc,package-lock.json
```

## 3. 구현 방법

### 3.1. package.json 스크립트 추가
```json
{
  "scripts": {
    "spell-check": "codespell --skip='*.pyc,venv/*,node_modules/*,__pycache__/*,package-lock.json'"
  }
}
```

### 3.2. 실행 방법
```bash
# npm 스크립트로 실행
npm run spell-check

# 또는 직접 실행
codespell --skip="*.pyc,venv/*,node_modules/*,__pycache__/*"
```

## 4. VS Code 확장 (선택사항)

**Code Spell Checker** 확장 설치:
- Extensions에서 "Code Spell Checker" 검색
- 실시간으로 오탈자 표시
- 개발 중 즉시 확인 가능

## 5. 다음 단계

1. ✅ codespell 설치: `pip install codespell`
2. ✅ package.json에 스크립트 추가
3. ✅ 테스트 실행: `npm run spell-check`
4. (선택) VS Code 확장 설치

