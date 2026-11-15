# Navigation Scenarios

- Design: [Navigation](../../../design/app/10-navigation.md).

## Navigation Without About
- Input: GPT 3D Visualizer.
- Steps: Open the app, navigate to How it works and open Feedback.
- Expected result: Both features work, About Developer opens the external developer page, and no creator profile overlay is present.
- Verification 2026-11-13: Production build passed. Headless Edge verified Home, How it works and Feedback, the current external About Developer link is covered by Feedback Dialog Scenarios; no profile requests.
