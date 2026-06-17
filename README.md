# EviChain Full-Stack Workspace

This workspace contains:

- React frontend (Vite): this folder
- Backend (separate package): evichain-backend/evichain-backend

The frontend is now integrated with backend APIs for:

- Wallet login (MetaMask signature + JWT)
- Evidence upload
- Evidence listing/search/view
- Hash verification

## 1. Install dependencies

From the workspace root:

```bash
npm install
npm run install:backend
```

## 2. Configure environment files

Frontend:

```bash
copy .env.example .env
```

Set frontend API endpoints in `.env` (recommended):

```bash
VITE_API_URL=http://localhost:3001/api
VITE_API_FALLBACK_URLS=http://localhost:3001/api,http://localhost:5000/api,http://localhost:3002/api
```

Backend:

```bash
copy evichain-backend\evichain-backend\.env.example evichain-backend\evichain-backend\.env
```

Then edit backend .env and set at least:

- RPC_URL
- PRIVATE_KEY
- CONTRACT_ADDRESS
- PINATA_API_KEY
- PINATA_SECRET_KEY
- JWT_SECRET
- FRONTEND_URL=http://localhost:5173
- PORT=3001 (or any free port)

## 3. Run the complete project

Start frontend + backend together from the root:

```bash
npm run dev:full
```

Or run separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Default URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 4. Use the app

1. Open frontend in browser.
2. Click Connect Wallet in top bar.
3. Approve MetaMask signature.
4. Use Sync to pull current evidence from backend.
5. Upload and verify evidence from the UI.

## 5. Build frontend

```bash
npm run build
```

## Notes

- Most backend routes require JWT auth, so wallet login is mandatory for upload/list/verify.
- Backend read endpoints return on-chain metadata; file names and tx hashes are only available immediately after new submissions.
