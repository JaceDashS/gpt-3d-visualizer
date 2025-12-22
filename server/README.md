---
title: GPT Token Visualizer
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# GPT Token Embedding Visualizer

A 3D visualization tool for GPT token embeddings. This FastAPI server provides token embedding extraction and visualization using the Llama-3.2-1B-Instruct model.

## Features

- **Token Embedding Extraction**: Extracts embeddings from input text and generated responses
- **PCA Dimensionality Reduction**: Reduces high-dimensional embeddings (2048D) to 3D for visualization
- **AI-Powered Response Generation**: Uses Llama-3.2-1B-Instruct model to generate responses
- **Automatic Model Download**: Automatically downloads model from Hugging Face Hub on first run

## API Endpoints

### `POST /api/visualize`
Tokenizes input text, generates response, and returns 3D vector embeddings.

**Request:**
```json
{
  "input_text": "Hello world!"
}
```

**Response:**
```json
{
  "tokens": [
    {
      "token": "Hello",
      "destination": [0.5, -0.3, 0.8],
      "is_input": true
    },
    ...
  ]
}
```

### `GET /health`
Health check endpoint that returns server status and model loading state.

## Tech Stack

- **FastAPI** - RESTful API framework
- **llama-cpp-python** - GGUF model inference
- **Hugging Face Hub** - Model downloading
- **NumPy** & **scikit-learn** - PCA dimensionality reduction
- **Uvicorn** - ASGI server
- **Python 3.11** - Runtime environment

## Configuration

The server automatically configures:
- Port: 7860 (Hugging Face Spaces default)
- Model: Llama-3.2-1B-Instruct-Q4_K_M.gguf
- CPU Threads: Configurable via `LLAMA_N_THREADS` environment variable (default: 2 for Docker)

## Model

The model is automatically downloaded from Hugging Face Hub on first run:
- Repository: `bartowski/Llama-3.2-1B-Instruct-GGUF`
- Model File: `Llama-3.2-1B-Instruct-Q4_K_M.gguf`
