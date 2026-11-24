# Data Flow

The browser sends text through the platform Visualizer route. The platform forwards it to the inference service. The browser turns the resulting token coordinates into the visualization.

```mermaid
flowchart LR
    A[Browser input] --> B[Platform Visualizer API]
    B[Platform Visualizer API] --> C[Inference service]
    C[Inference service] --> D[Token coordinates]
    D[Token coordinates] --> E[Browser scene]
```

See [Architecture Overview](10-overview.md).
