# How to run SVRST Trust

## Requirements

- Node.js 18 or newer
- npm

## Public website

From the repository root:

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To create and preview a production build:

```sh
npm run build
npm run preview
```

## Public website API

The public forms use the separately deployed API configured by
`VITE_API_BASE_URL`. That backend is not included in this workspace. Start the
website with the API URL available in its environment.

```sh
copy .env.example .env
npm run dev
```

- Public website: http://localhost:5173
- SVRST ERP auth: http://localhost:5174/auth
- Public API health: http://localhost:5000/api/health (when the configured API is running)

## Existing SVRST ERP

Run the existing ERP in a second terminal. It uses its own Supabase Auth,
PostgreSQL database and role-protected application routes:

```sh
cd latest_ERP
npm install
npm run dev
```

The ERP development URL is http://localhost:5174. Website Login links to its
`/auth` route; ERP access remains controlled by the ERP's existing roles.

Set `VITE_API_BASE_URL` in the root `.env` when using a deployed backend.
Keep payment provider keys in the backend only.
