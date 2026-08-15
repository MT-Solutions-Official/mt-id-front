# MT ID Console

Frontend do provedor de identidade: landing, documentação de integração e dashboard do owner.

A API (Quarkus, porta **8081**) vive no repositório irmão **[mt-id](../mt-id)**. Este repo é só o console.

## Stack

React + Vite + Tailwind (JavaScript). Porta **3000** — é a origin de plataforma do backend (`APP_MT_ID_CORS_ORIGIN`).

## Desenvolvimento

Suba a API em `mt-id`:

```bash
cd ../mt-id
./mvnw quarkus:dev
```

Neste diretório:

```bash
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:3000`. Primeiro owner: `/signup`. Docs: `/docs`.

## Env

```
VITE_API_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=<Google OAuth client id de owner>
```
