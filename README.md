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

The model server and API are operated in the jace-s-platform repository. The client calls `/api/gptvisualizer` on `https://jace-s.com`.

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
└── package.json              # Root scripts
```

## Getting Started

### Prerequisites

- **Node.js** 26.x
- **npm** >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gpt-visualizer
   ```

2. **Install client dependencies**
   ```bash
   cd client && npm install
   ```

### Running the Application

```bash
# Client (port 3000)
npm run client:start
```

Set `REACT_APP_API_URL` (e.g. `https://jace-s.com`), `REACT_APP_API_PREFIX` (e.g. `/api/gptvisualizer`) and `REACT_APP_NOTICE_APP_ID` (`21`) for the client build. See `client/PLATFORM_INTEGRATION.md`.

## Model Information

The application uses **Llama-3.2-1B-Instruct-Q4_K_M** model from Hugging Face:
- **Repository**: `bartowski/Llama-3.2-1B-Instruct-GGUF`
- **Model Size**: ~770MB
- **Quantization**: Q4_K_M (4-bit quantization)
- **Hosting**: Served by the jace-s-platform model server

## Usage

1. Open `http://localhost:3000` in your browser
2. Enter English text in the input field
3. Click "Visualize" to process the text
4. The platform server will:
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

The client calls the following platform endpoints. See `client/PLATFORM_INTEGRATION.md` for the full contract (status codes, timeouts, credentials).

### `POST https://jace-s.com/api/gptvisualizer/visualize`

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

### `GET https://jace-s.com/health?app=21`

Service status and announcements for this app, called once on entry.

**Response:**
```json
{
  "schemaVersion": 1,
  "serviceStatus": "operational",
  "message": "...",
  "maintenance": null,
  "announcements": []
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
| `npm run client:start` | Start client only (port 3000) |
| `npm run build` | Build client for production (used by Vercel) |
| `npm run client:build` | Build client for production |
| `npm run spell-check` | Run spell checker |

### Code Style

- **TypeScript** for type safety on the client
- **Modular component architecture**
- **Custom hooks** for reusable logic
- **Constants** for configurable values

## License

Private project - All rights reserved.
