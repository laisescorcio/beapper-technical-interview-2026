# Repository Guidelines

## Project Structure

This Nx workspace contains a Next.js app using React Native Web in `apps/web/src/app` and an Expo/React Native app in `apps/app/src/app`. Keep shared screens in `libs/components` and reusable UI in `libs/controls` or `libs/controls-basic`. Shared icons live in `libs/assets`, web static assets in `apps/web/public`, and mock API fixtures in `libs/dev-tools/src/mock-api`.

Use each library's public `src/index.ts` exports through its package name. Route UI data access through `ui-api-interaction` and `api-controller`. Keep dependencies flowing toward the foundation libraries and use the Email address feature as a working example of the layers.

## Build, Test, and Development

Use Node 22 and npm 11. Run these commands from the repository root.

- `npm install` installs workspace dependencies.
- `npx nx dev web` starts the web app at `http://localhost:3000`.
- `npx nx build web` builds the Next.js app.
- `npx nx run-ios app` or `npx nx run-android app` builds and runs the optional native app with Xcode or Android Studio.
- `npx nx run-many -t typecheck lint` runs the CI checks. Resolve all errors and warnings before submitting.
- `npm run all:test` runs the workspace Jest targets.

## Coding Style

Use TypeScript and TSX with two-space indentation, single quotes, and trailing commas as configured by Prettier. Follow ESLint's import sorting and Nx module boundaries. Use PascalCase for components and camelCase for hooks and utilities. Follow the existing `.web.ts` and `.web.tsx` naming pattern for web-specific implementations.

## Testing

Place new Jest tests alongside the code as `*.spec.ts` or `*.spec.tsx`. The repository has no configured coverage threshold. For payment history changes, verify pagination, refresh, and retry in the browser. Set `NEXT_PUBLIC_MOCK_API_SCENARIO` to exercise `default`, `empty`, `error`, and `next-page-error`. Use `EXPO_PUBLIC_MOCK_API_SCENARIO` for native verification.

## Commits and Review

The history starts with `Initial commit`. Use short, descriptive subjects and commit in focused steps. For review, summarize the change, checks run, and any platform limitations. For interview submissions, follow the private repository instructions in `README.md` and record decisions and trade-offs in `NOTES.md`.
