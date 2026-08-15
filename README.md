# MT ID Console

Frontend do provedor de identidade: landing, documentação de integração e dashboard do owner.

## Stack

React + Vite + Tailwind (JavaScript). Porta **3000** — é a origin de plataforma do backend.

## Desenvolvimento

Na raiz do monorepo, o IdP:

```bash
mvn quarkus:dev
```

Neste diretório:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Env

```
VITE_API_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=<Google OAuth client id de owner>
```

Crie um `.env` local com base no `.env.example`.

Exemplo para produção (Render):

```
VITE_API_URL=https://mt-id-api.onrender.com
```

## Deploy (Vercel)

1. Importar o repositório na Vercel com preset `Vite`.
2. Definir variáveis de ambiente no projeto:

```
VITE_API_URL=https://mt-id-api.onrender.com
VITE_GOOGLE_CLIENT_ID=<Google OAuth client id de owner>
```

3. Fazer deploy.

Observação: no backend, adicione a origin do front em `allowedOrigins` da aplicação (ex.: `https://seu-projeto.vercel.app`) para o CORS permitir login e chamadas autenticadas.
