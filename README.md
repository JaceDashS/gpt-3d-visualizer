# GPT Token Embedding Visualizer

A 3D visualization tool for GPT token embeddings. This application visualizes how tokens are processed and transformed through vector space, providing an intuitive understanding of how language models work.

## Features

- **3D Token Visualization**: Interactive 3D view of token embeddings using Three.js
- **Real-time Animation**: Watch tokens being processed step by step with smooth animations
- **User Input**: Enter custom English text to visualize
- **Animation Controls**: Play/pause, speed control, step-by-step navigation
- **Responsive UI**: Always-visible coordinate axes and control panel

## Tech Stack

### Client
- **React 19** with TypeScript
- **Three.js** with React Three Fiber & Drei
- **Custom Hooks** for state management

### Server
- **FastAPI** (Python)
- **NumPy** & **scikit-learn** for PCA dimensionality reduction

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
│   │   │   ├── animation.ts
│   │   │   ├── colors.ts
│   │   │   └── visualization.ts
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAnimationTimer.ts
│   │   │   └── useVisualizationApi.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── inputValidation.ts
│   │   │   └── vectorMath.ts
│   │   ├── services/          # API client
│   │   └── config/            # API configuration
│   └── package.json
├── server/                    # FastAPI backend
│   ├── main.py               # API endpoints
│   ├── config.py             # Server configuration
│   └── requirements.txt
└── package.json              # Root scripts
```

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- Python >= 3.8
- npm >= 8.0.0

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
   cd server && python -m pip install -r requirements.txt
   ```

### Running the Application

**Start both client and server:**
```bash
npm run dev
```

Or run separately:
```bash
# Client only (port 3000)
npm run client:start

# Server only (port 8000)
npm run server:dev
```

### Usage

1. Open `http://localhost:3000` in your browser
2. Enter English text in the input field
3. Click "Visualize" to process the text
4. Use the animation controls to step through the token generation:
   - **Play/Pause**: Start or stop automatic animation
   - **Slider**: Jump to a specific step
   - **Speed**: Adjust animation speed (0.25x - 3x)
   - **Reset**: Return to the beginning

## API Endpoints

### `POST /api/visualize`
Tokenizes input text and returns vector embeddings.

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
Health check endpoint.

## Configuration

### Animation Settings (`client/src/constants/animation.ts`)
- `TARGET_FPS`: Animation frame rate (default: 60)
- `GATHER_PROGRESS_INCREMENT`: Gathering animation speed
- `GROW_PROGRESS_INCREMENT`: Vector growth animation speed

### Visualization Settings (`client/src/constants/visualization.ts`)
- `TEXT_OFFSET_Y`: Text offset from vector line
- `CAMERA_MIN/MAX_POLAR_ANGLE`: Camera rotation limits
- `ARROW_HEAD_*`: Arrow appearance settings

### Colors (`client/src/constants/colors.ts`)
- `INPUT_TOKEN_COLOR`: Color for input tokens (green)
- `OUTPUT_TOKEN_COLOR`: Color for output tokens (red)

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client and server |
| `npm run client:start` | Start client only |
| `npm run server:dev` | Start server with hot reload |
| `npm run client:build` | Build client for production |

### Code Style

- TypeScript for type safety
- Modular component architecture
- Custom hooks for reusable logic
- Constants for configurable values

## License

Private project - All rights reserved.

