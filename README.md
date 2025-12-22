---
title: GPT Visualizer Server
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---
<!-- This block provides metadata for project automation tools (e.g., GitHub Actions workflows) -->

# GPT Token Embedding Visualizer

A 3D visualization tool for GPT token embeddings. This application visualizes how tokens are processed and transformed through vector space using PCA (Principal Component Analysis), providing an intuitive understanding of how language models work.

## Features

- **3D Token Visualization**: Interactive 3D view of token embeddings using Three.js
- **Real-time Animation**: Watch tokens being processed step by step with smooth animations
- **AI-Powered Response Generation**: Uses Llama-3.2-1B-Instruct model to generate responses
- **Embedding Extraction**: Extracts token embeddings from both input and generated output
- **PCA Dimensionality Reduction**: Reduces high-dimensional embeddings (2048D) to 3D for visualization
- **User Input**: Enter custom English text to visualize
- **Animation Controls**: Play/pause, speed control, step-by-step navigation
- **Responsive UI**: Always-visible coordinate axes and control panel
- **Multi-language Support**: Supports English, Korean, Japanese, and Chinese

## Tech Stack

### Client
- **React 19** with TypeScript
- **Three.js** with React Three Fiber & Drei for 3D visualization
- **Custom Hooks** for state management
- **React Router** for navigation

### Server
- **FastAPI** (Python) - RESTful API framework
- **llama-cpp-python** - GGUF model inference
- **Hugging Face Hub** - Model downloading
- **NumPy** & **scikit-learn** - PCA dimensionality reduction
- **Uvicorn** - ASGI server

### Deployment
- **Docker** - Containerized server deployment
- **Python 3.11** - Runtime environment

## Project Structure

```
gpt-visualizer/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── controls/      # UI control components
│   │   │   │   ├── AnimationControlBar.tsx
│   │   │   │   ├── InputPanel.tsx
│   │   │   │   └── LoadingIndicator.tsx
│   │   │   ├── visualization/ # 3D visualization components
│   │   │   │   ├── VectorArrow.tsx
│   │   │   │   ├── TokenPoint.tsx
│   │   │   │   └── GatheringToken.tsx
│   │   │   ├── TokenVisualization.tsx
│   │   │   └── VisualizationContainer.tsx
│   │   ├── constants/         # Configuration constants
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── services/          # API client
│   │   └── config/            # API configuration
│   └── package.json
├── server/                    # FastAPI backend
│   ├── main.py               # FastAPI app and endpoints
│   ├── model.py              # Model loading and Hugging Face integration
│   ├── routes.py             # API route handlers
│   ├── utils.py              # Utility functions (PCA, embeddings)
│   ├── schemas.py            # Pydantic models
│   ├── config.py             # Server configuration
│   ├── Dockerfile            # Docker configuration
│   ├── requirements.txt      # Python dependencies
│   └── models/               # Model storage (auto-created)
│       └── .cache/           # Hugging Face cache
└── package.json              # Root scripts
```

## Getting Started

### Prerequisites

- **Node.js** >= 16.0.0
- **Python** >= 3.11
- **npm** >= 8.0.0
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gpt-visualizer
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

   Or install separately:
   ```bash
   # Client dependencies
   cd client && npm install

   # Server dependencies
   cd server && python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### Running the Application

**Start both client and server:**
```bash
npm run dev
```

**Or run separately:**
```bash
# Client only (port 3000)
npm run client:start

# Server only (port 8000)
npm run server:dev
```

### Docker Deployment

**Build Docker image:**
```bash
npm run server:docker:build
```

**Run Docker container:**
```bash
npm run server:docker:run
```

**View logs:**
```bash
npm run server:docker:logs
```

**Stop container:**
```bash
npm run server:docker:stop
```

## Model Information

The application uses **Llama-3.2-1B-Instruct-Q4_K_M** model from Hugging Face:
- **Repository**: `bartowski/Llama-3.2-1B-Instruct-GGUF`
- **Model Size**: ~770MB
- **Quantization**: Q4_K_M (4-bit quantization)
- **Download**: Automatically downloaded from Hugging Face on first run

The model is automatically downloaded to `server/models/` directory when the server starts.

## Usage

1. Open `http://localhost:3000` in your browser
2. Enter English text in the input field
3. Click "Visualize" to process the text
4. The server will:
   - Generate a response using the Llama model
   - Extract token embeddings from input and output
   - Apply PCA to reduce dimensions to 3D
   - Return visualization data
5. Use the animation controls to step through the token generation:
   - **Play/Pause**: Start or stop automatic animation
   - **Slider**: Jump to a specific step
   - **Speed**: Adjust animation speed (0.25x - 3x)
   - **Reset**: Return to the beginning

## API Endpoints

### `POST /api/visualize`

Tokenizes input text, generates a response, extracts embeddings, and returns 3D vectors.

**Request:**
```json
{
  "input_text": "Hello, how are you?"
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
    {
      "token": "I",
      "destination": [-0.2, 0.4, -0.6],
      "is_input": false
    },
    ...
  ]
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "GPT Visualizer",
  "version": "1.0.0"
}
```

## How It Works

1. **Input Processing**: User enters text, which is tokenized by the Llama model
2. **Response Generation**: The model generates a response based on the input
3. **Embedding Extraction**: Token embeddings (2048 dimensions) are extracted for both input and output tokens
4. **PCA Reduction**: All embeddings are combined and reduced to 3 dimensions using Principal Component Analysis
5. **Normalization**: 3D vectors are normalized to [-1, 1] range
6. **Visualization**: Vectors are displayed in 3D space with smooth animations

## Configuration

### Server Configuration (`server/config.py`)
- `SERVER_HOST`: Server host (default: `0.0.0.0`)
- `SERVER_PORT`: Server port (default: `8000`)
- `CORS_ORIGINS`: Allowed CORS origins (default: `["*"]`)

### Model Configuration (`server/model.py`)
- `HF_REPO_ID`: Hugging Face repository ID
- `HF_FILENAME`: Model filename
- Model is automatically downloaded on first run

### Animation Settings (`client/src/constants/animation.ts`)
- `TARGET_FPS`: Animation frame rate (default: 60)
- `GATHER_PROGRESS_INCREMENT`: Gathering animation speed
- `GROW_PROGRESS_INCREMENT`: Vector growth animation speed
- `MIN_ANIMATION_SPEED`: Minimum speed (0.25x)
- `MAX_ANIMATION_SPEED`: Maximum speed (3x)

### Visualization Settings (`client/src/constants/visualization.ts`)
- `TEXT_OFFSET_Y`: Text offset from vector line
- `CAMERA_MIN/MAX_POLAR_ANGLE`: Camera rotation limits
- `ARROW_HEAD_*`: Arrow appearance settings

### Colors (`client/src/constants/colors.ts`)
- `INPUT_TOKEN_COLOR`: Color for input tokens (green)
- `OUTPUT_TOKEN_COLOR`: Color for output tokens (red)

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client and server |
| `npm run client:start` | Start client only (port 3000) |
| `npm run server:dev` | Start server only (port 8000) |
| `npm run client:build` | Build client for production |
| `npm run server:install` | Install server dependencies |
| `npm run server:docker:build` | Build Docker image |
| `npm run server:docker:run` | Run Docker container |
| `npm run server:docker:stop` | Stop Docker container |
| `npm run server:docker:logs` | View Docker logs |
| `npm run spell-check` | Run spell checker |

### Code Style

- **TypeScript** for type safety on the client
- **Python type hints** for server code
- **Modular component architecture**
- **Custom hooks** for reusable logic
- **Constants** for configurable values
- **Pydantic models** for API validation

## Troubleshooting

### Port Already in Use

If port 8000 is already in use:
```bash
# Windows
netstat -ano | findstr :8000
Stop-Process -Id <PID> -Force

# Linux/Mac
lsof -ti:8000 | xargs kill
```

### Model Download Issues

- Ensure internet connection is available
- Check Hugging Face repository accessibility
- Model is cached after first download in `server/models/.cache/`

### Docker Issues

- Ensure Docker is running
- Check Docker logs: `npm run server:docker:logs`
- Verify port mapping: `-p 8000:8000`

## License

Private project - All rights reserved.
