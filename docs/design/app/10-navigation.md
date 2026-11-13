# Navigation Design

- Input: Application entry and navigation actions.
- Output: Product views without creator About navigation.
- Code: client/src/App.tsx, client/src/components/navigation/FloatingNav.tsx, client/src/constants/animation.ts.
- Implementation: Home, How it works and Feedback remain available. There is no creator About navigation entry, overlay, state or profile fetch triggered by the application.
- Spec: [Navigation](../../specs/app/10-navigation.md).
- Architecture: [Overview](../../architecture/10-overview.md).
- Scenarios: [Navigation](../../testing/scenarios/app/10-navigation.md).

## Example
- Input: GPT 3D Visualizer.
- Steps: Open the app, navigate to How it works and open Feedback.
- Expected result: Both features work and no About button or creator overlay is present.
