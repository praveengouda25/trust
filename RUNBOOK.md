# SVRST Trust local runbook

The repository contains the SVRST public website and the existing
`latest_ERP` application. The website public API is configured separately via
`VITE_API_BASE_URL`; it is not included in this workspace.

```sh
# public website
npm install
npm run dev

# existing ERP, in a second terminal
cd latest_ERP
npm install
npm run dev

```

Public website: `http://localhost:5173`  
SVRST ERP auth: `http://localhost:5174/auth`  
Public API health: `http://localhost:5000/api/health` when the configured API is running.

Website Login opens the existing ERP authentication. ERP roles and database
access remain managed by `latest_ERP`; public website registration does not
create ERP users.

Set `VITE_API_BASE_URL` in the root `.env` for a deployed API. Razorpay keys
must remain backend-only. Donations are stored as pending until server-side
payment creation and signature verification are configured.
