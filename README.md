# MYStockHub frontend

Responsive React application for the MYStockHub inventory and business-management API. The app uses Vite, React Router, Zustand, Axios, Tailwind CSS and Lucide icons.

## Local development

Requires Node.js and npm. Start the backend separately (see [the backend README](../Inventory-Backend-main/README.md)); it connects to MongoDB and handles email delivery.

```sh
npm ci
npm run dev
```

Configure the frontend environment before starting Vite:

```env
VITE_API_URL=http://localhost:3000
VITE_GMAIL_CLIENT_ID=<Google OAuth web client ID>
```

The Google client ID must match the backend's `GMAIL_CLIENT_ID`. Only public browser configuration belongs in frontend environment variables; never put a Google client secret, mail refresh token, database URI, or JWT secret here.

## Validation and production build

```sh
npm run lint
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host configured to serve `index.html` for client-side routes. Configure the backend CORS allow-list with the deployed frontend origin and provide the production `VITE_API_URL` at build time. The API must be reachable over HTTPS, and reverse proxies must permit long-lived authenticated Server-Sent Event responses for live notifications.

The frontend includes organization-member permission guards for routes and actions; the API remains authoritative and independently enforces those permissions. Google-only accounts use the verified-email OTP password-reset flow to set their first local password or change a forgotten one.
