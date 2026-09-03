# SVRST Trust

Public website and ERP for SVRST Trust (Mathrudhama Children's Village).

Deploy from GitHub to Vercel using this repository's `vercel.json`.

## Development

You need Node.js 18+ and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
copy .env.example .env
npm install
npm install --prefix latest_ERP
npm run dev
```

- Website: http://localhost:5173
- Website login links to ERP auth at http://localhost:5173/erp/auth (proxied to the ERP on port 5174)
- ERP directly: http://localhost:5174/auth

## Production build

```sh
npm run build
npm run preview
```

Vercel builds the website and ERP together and serves ERP under `/erp`. Website Login continues to open `/erp/auth`.
