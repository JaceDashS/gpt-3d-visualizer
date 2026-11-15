# Navigation Design

- Input: Application entry and navigation actions.
- Output: Product views without creator About navigation.
- Code: client/src/App.tsx, client/src/components/navigation/FloatingNav.tsx, client/src/constants/animation.ts.
- Implementation: Home, How it works and Feedback remain available. About Developer opens https://jace-s.com/about in a separate tab. No creator profile overlay, state or profile fetch runs inside the application.
- Spec: [Navigation](../../specs/app/10-navigation.md).
- Architecture: [Overview](../../architecture/10-overview.md).
- Scenarios: [Navigation](../../testing/scenarios/app/10-navigation.md).

## Example
- Input: GPT 3D Visualizer.
- Steps: Open the app, navigate to How it works and open Feedback.
- Expected result: Both features work, About Developer opens the external developer page, and no creator profile overlay is present.
