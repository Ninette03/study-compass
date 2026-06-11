**Study Compass — Frontend**

**Overview**
- **Description**: Frontend application for Study Compass. React + TypeScript SPA that consumes the backend API.

**Prerequisites**
- **Node.js**: v16+ recommended.
- **npm** or **yarn** to install dependencies.

**Quick Start**
- Install dependencies: `cd frontend && npm install`
- Copy or configure frontend environment variables as required (see `frontend/package.json` for any scripts that read env vars).
- Start dev server: `npm run dev` or `npm start` depending on the project scripts.

**Project Structure (high level)**
- **Entry**: `frontend/src/app/App.tsx` — main app component (see [frontend/src/app/App.tsx](frontend/src/app/App.tsx)).
- **Pages / Components**: `frontend/src/components/`, `frontend/src/pages/`
- **State / Services**: `frontend/src/services/` — API client and business logic

**Scripts**
- **Install**: `npm install`
- **Dev**: `npm run dev` — start development server with hot reload
- **Build**: `npm run build` — create optimized production build
- **Start**: `npm start` — serve production build

**Environment & API**
- Configure the backend API base URL in your environment variables (e.g. `VITE_API_URL` or `REACT_APP_API_URL`) depending on the frontend tooling. The app expects the backend API to be reachable and authorized requests to use JWT-based tokens.

**Testing**
- If tests exist, run them with `npm test`. Add unit and integration tests under `frontend/src/__tests__/`.

**Deployment**
- This frontend is intended to be deployed on Vercel. Set the API base URL (`VITE_API_URL` or `REACT_APP_API_URL`) in the Vercel project environment settings.
- Build with `npm run build` and deploy the produced static assets to Vercel. For SPA routing, ensure Vercel is configured to rewrite all routes to `index.html` (or use Vercel's SPA settings).

**Contributing**
- Follow code style, create focused PRs, and include screenshots or gifs for UI changes.

**Contact**
- If unsure about API contracts, check the backend docs at [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) or contact the backend maintainer.
