# ZyID Local Verification

ZyID is a browser-local document verification prototype. It keeps files, OCR/classification, reports, history, and screening records in the browser. It does not require an API key, database, authentication provider, cloud service, paid service, or external verification API.

## Project structure

```text
zyid/
  frontend/
    src/
      components/
      pages/
      services/
      utils/
      styles/
      App.jsx
      main.jsx
    package.json
    vite.config.js
  backend/
    src/server.js
    package.json
  package.json
```

## Run locally

```bash
npm install
npm run dev
```

The frontend runs on Vite's local development server. The backend is an optional dependency-free static server for a built frontend:

```bash
npm run build
npm start
```

## Product behavior

- Verification shows the document result and a compact percentage signal only.
- Identity, name, document details, and case/offence information live in Cyber Intelligence.
- Record Screening stores local PDFs and signals without duplicating case intelligence.
- A matched fictional demo record uses a soft red Cyber Intelligence surface.
- Upload, image/PDF preview, local OCR hook, classification, multi-document verification, reports, history, and local persistence are browser-only.