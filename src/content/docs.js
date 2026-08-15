import { API_URL } from '../lib/env'

export const docsNav = [
  {
    title: 'Começar',
    items: [
      { to: '/docs', label: 'Visão geral' },
      { to: '/docs/quickstart', label: 'Quickstart' },
      { to: '/docs/architecture', label: 'Arquitetura' },
    ],
  },
  {
    title: 'Integração',
    items: [
      { to: '/docs/application-auth', label: 'Token da aplicação' },
      { to: '/docs/users', label: 'Usuários' },
      { to: '/docs/user-auth', label: 'Login de usuários' },
      { to: '/docs/google', label: 'Google' },
      { to: '/docs/cors', label: 'CORS e browser' },
    ],
  },
  {
    title: 'Referência',
    items: [
      { to: '/docs/routes', label: 'Índice de rotas' },
      { to: '/docs/jwt', label: 'JWT e papéis' },
      { to: '/docs/applications', label: 'Client applications' },
      { to: '/docs/owners', label: 'Owners' },
      { to: '/docs/roles', label: 'Papéis de user' },
      { to: '/docs/emails', label: 'E-mail e senha' },
      { to: '/docs/errors', label: 'Erros e limites' },
      { to: '/docs/addresses', label: 'Endereços' },
    ],
  },
]

export const docsFlat = docsNav.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    slug: item.to === '/docs' ? 'overview' : item.to.replace('/docs/', ''),
  })),
)

const BASE = API_URL

export const docs = {
  overview: {
    kicker: 'Documentação',
    title: 'MT ID como provedor de identidade',
    lead: 'Sua app não implementa senha, JWT nem e-mail de verificação. Ela chama esta API. Há três atores: o owner da plataforma, a client application e o user final dessa application.',
    sections: [
      {
        title: 'Como integrar em uma frase',
        paragraphs: [
          'No console, um owner cria uma client application e copia appId, apiKey e apiSecret. O backend da sua app troca apiKey/apiSecret por um JWT APPLICATION e cria users. O front da sua app manda appId no header, faz login do user e guarda access + refresh. O token de uma app não lê a outra.',
        ],
      },
      {
        title: 'Os três atores',
        table: {
          headers: ['Ator', 'Grupo JWT', 'Onde vive o secret', 'O que faz'],
          rows: [
            ['Owner', 'OWNER', 'Senha da conta MT ID', 'Console: cria apps, time, settings. Writer/viewer é por app, não neste cadastro.'],
            ['Application', 'APPLICATION', 'apiKey + apiSecret no servidor', 'Criar/desativar users, girar secret. Sem refresh: quando expirar, peça outro token.'],
            ['User', 'USER (+ papéis da sua app)', 'Senha ou Google', 'Front da sua app: /users/me, endereço, imagens. Access curto + refresh rotacionado.'],
          ],
        },
      },
      {
        title: 'Base URL',
        paragraphs: [
          'Dev: IdP na 8081, console na 3000. A origin do console (http://localhost:3000) é a da plataforma e passa no CORS sem appId. A origin do seu front precisa estar em allowedOrigins da app.',
        ],
        code: {
          language: 'bash',
          code: `${BASE}
Swagger: ${BASE}/swagger-ui
OpenAPI: ${BASE}/q/openapi`,
        },
      },
      {
        title: 'O que o IdP já faz',
        bullets: [
          'Cadastro e login de users com senha. E-mail verificado é obrigatório no login por senha.',
          'Lista users da app (GET /users, APPLICATION). O próprio user atualiza nome, e-mail e senha em PATCH /users/me.',
          'Login Google via JWKS (iss, assinatura, exp, audience, email_verified). User novo é provisionado; owner Google precisa já existir.',
          'Access JWT curto (15 min por padrão). Refresh de user/owner com rotação e jti hasheado. Application não tem refresh.',
          'CORS por app: a Origin só passa se for a da plataforma ou se estiver em allowedOrigins da app ativa resolvida.',
          'Política de senha (8–72, Aa, número, especial) e HIBP. Throttle de login, token de app, e-mail e CEP.',
        ],
      },
      {
        title: 'O que esta API não tem',
        bullets: [
          'Não há disable de owner. A conta do console não se desliga por API.',
          'Não há GET /api/v1/owner listando cadastros da plataforma. Time é por aplicação.',
        ],
        callout: {
          tone: 'warn',
          title: 'apiSecret aparece uma vez',
          body: 'POST /client-applications/create e os dois rotate-secret devolvem apiSecret. GET, list, settings, disable e enable nunca devolvem. Senha de user também nunca sai no JSON.',
        },
      },
    ],
  },

  quickstart: {
    kicker: 'Integração',
    title: 'Do zero até o primeiro login',
    lead: 'Seis passos: criar a app, guardar o secret, autenticar o backend, criar um user, confirmar o e-mail e logar no browser com o header appId.',
    sections: [
      {
        title: '1. Crie a aplicação no console',
        steps: [
          'Faça login como owner em /login (este front, porta 3000).',
          'Abra Aplicações → Nova. Informe allowedOrigins do seu front (ex.: http://localhost:5173).',
          'Se for usar Google no user, grave o Client ID OAuth em googleAudience.',
          'Marque requiredUserFields. Lista vazia = o create de user aceita o mínimo do DTO (quase vazio).',
        ],
        callout: {
          tone: 'warn',
          title: 'Copie apiKey, apiSecret e appId',
          body: 'A resposta 201 traz apiSecret. Depois disso, só rotate devolve de novo. Perdeu o secret? Writer da app no console, ou PATCH /api/v1/client-applications/rotate-secret com JWT APPLICATION.',
        },
      },
      {
        title: '2. Token da aplicação — só no servidor',
        paragraphs: [
          'Nunca coloque apiSecret no browser. O backend troca as credenciais por um JWT APPLICATION. Não existe refresh de application: quando expirar, peça outro.',
          'expiresIn está em segundos. Padrão: jwtExpirationInMinutes da app (15 → 900s), ou o global se a app não tiver valor.',
        ],
        codeTabs: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST ${BASE}/api/v1/auth/application/token \\
  -H "apiKey: YOUR_API_KEY" \\
  -H "apiSecret: YOUR_API_SECRET"`,
          },
          {
            label: 'Node',
            language: 'javascript',
            code: `const res = await fetch("${BASE}/api/v1/auth/application/token", {
  method: "POST",
  headers: { apiKey: process.env.MT_API_KEY, apiSecret: process.env.MT_API_SECRET },
});
const { accessToken, expiresIn } = await res.json();`,
          },
        ],
        code: {
          language: 'json',
          code: `{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}`,
        },
      },
      {
        title: '3. Crie um usuário',
        paragraphs: [
          'Authorization: Bearer <token APPLICATION>. O appId sai do JWT, não do body. email é um array: o primeiro vira primary. Depois do create o IdP tenta enviar o e-mail de verificação (best-effort: o user é criado mesmo se o SMTP falhar).',
        ],
        code: {
          language: 'bash',
          code: `curl -X POST ${BASE}/api/v1/users/create \\
  -H "Authorization: Bearer APP_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "username": "jane",
    "email": ["jane@example.com"],
    "password": "StrongPassword123!",
    "phones": [{ "phoneNumber": "+5521999999999" }],
    "document": { "cpf": "12345678900" }
  }'`,
        },
      },
      {
        title: '4. Confirme o e-mail',
        paragraphs: [
          'Sem e-mail verificado, POST /auth/users/token responde 403 EMAIL_NOT_VERIFIED. Google não exige isso: o IdP marca o e-mail como verificado.',
          'O link do e-mail aponta para verificationRedirectUrl da app (com ?token=) se a origin estiver em allowedOrigins e o esquema for https (ou http em localhost/127.0.0.1). Senão, o MT ID serve GET /api/v1/email/users/verify?token=.',
        ],
      },
      {
        title: '5. Login do user no browser',
        paragraphs: [
          'appId vai no header, não no body. A Origin do seu front precisa estar em allowedOrigins. O mesmo header resolve o CORS.',
        ],
        codeTabs: [
          {
            label: 'fetch',
            language: 'javascript',
            code: `const response = await fetch("${BASE}/api/v1/auth/users/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    appId: "YOUR_APP_ID",
  },
  body: JSON.stringify({
    email: "jane@example.com",
    password: "StrongPassword123!",
  }),
});
const session = await response.json();
// session.accessToken, session.refreshToken, session.expiresIn`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST ${BASE}/api/v1/auth/users/token \\
  -H "Content-Type: application/json" \\
  -H "appId: YOUR_APP_ID" \\
  -d '{"email":"jane@example.com","password":"StrongPassword123!"}'`,
          },
        ],
      },
      {
        title: '6. Refresh na sua app',
        paragraphs: [
          'O IdP não renova access sozinho. Quando o access expirar (401), o seu front chama POST /api/v1/auth/users/refresh com Authorization: Bearer <refreshToken>. A resposta traz um par novo; o jti anterior morre. Logout: POST /api/v1/auth/users/logout com o mesmo refresh → 204.',
        ],
        callout: {
          tone: 'info',
          title: 'Console ≠ sua app',
          body: 'O interceptor de 401 deste console é só da sessão OWNER. Copie o padrão para o user, apontando para /auth/users/refresh.',
        },
      },
    ],
  },

  architecture: {
    kicker: 'Modelo',
    title: 'Arquitetura multi-app',
    lead: 'Owner → ClientApplication → User. Cada app isola users, papéis, origins, audience Google e branding de e-mail.',
    sections: [
      {
        title: 'Grafo',
        bullets: [
          'Owner administra uma ou mais client applications. Na mesma conta, em cada app o papel é OWNER_WRITER ou OWNER_VIEWER — isso vive em client-application.owners[], não no cadastro do owner.',
          'Client application tem appId, apiKey, apiSecret (bcrypt), allowedOrigins, googleAudience, requiredUserFields, jwtExpirationInMinutes, refreshTokenExpirationInDays e emailSettings.',
          'User pertence a exatamente um appId. E-mail e username são únicos por app, não globalmente.',
        ],
      },
      {
        title: 'Quem chama o quê',
        table: {
          headers: ['Chamada', 'Auth'],
          rows: [
            ['Criar, listar, disable, enable user', 'APPLICATION'],
            ['Login senha do user', 'público + header appId'],
            ['Login Google do user', 'público + appId no body (e no header no browser, por CORS)'],
            ['GET /users/me e PATCH /users/me', 'USER (só o próprio)'],
            ['GET /users/{id}, endereço, imagem', 'USER (só o próprio) ou APPLICATION no mesmo appId'],
            ['Ler app, listar papéis, ver time', 'OWNER membro da app (writer ou viewer)'],
            ['Settings, disable, rotate, papéis write, time write', 'OWNER writer nesta app'],
            ['Criar app', 'qualquer OWNER autenticado — vira writer nela'],
            ['Refresh / logout', 'REFRESH_TOKEN (o JWT de refresh, não o access)'],
          ],
        },
      },
      {
        title: 'Isolamento',
        bullets: [
          'APPLICATION só enxerga users do app_id do próprio JWT.',
          'USER só lê/edita o próprio userId no mesmo app_id.',
          'Owner só opera apps das quais é membro. Write exige OWNER_WRITER nessa app.',
          'CORS: sem appId resolvido, só a origin da plataforma (default http://localhost:3000) passa.',
        ],
      },
      {
        title: 'Conta ou app desativada',
        bullets: [
          'Disable de user (APPLICATION): revoga os refresh daquele user. Access JWT ainda no relógio é recusado no próximo request (403 ACCOUNT_DISABLED), exceto logout com refresh.',
          'Disable de app (writer): marca active=false, revoga todos os refresh de users da app e recusa JWT APPLICATION e USER no próximo request (403 ACCOUNT_DISABLED). CORS da app para. Login por senha, Google e token APPLICATION com essa app → 401 genérico (não vaza ACCOUNT_DISABLED no login público).',
          'Refresh de user com a app desativada também falha com 401. Reative a app para voltar a emitir sessão.',
          'Não há disable de owner por API. O filtro ainda honra owner.active se estiver false no banco.',
        ],
      },
    ],
  },

  'application-auth': {
    kicker: 'Contrato',
    title: 'Autenticação da aplicação',
    lead: 'Troca apiKey + apiSecret (headers) por um JWT APPLICATION. Sem body. Sem refresh. Só servidor.',
    sections: [
      {
        title: 'Emitir token',
        endpoint: { method: 'POST', path: '/api/v1/auth/application/token', auth: 'público' },
        fields: [
          { name: 'apiKey', required: true, notes: 'Header. Não vai no JSON.' },
          { name: 'apiSecret', required: true, notes: 'Header. Comparado com hash bcrypt.' },
        ],
        codeTabs: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST ${BASE}/api/v1/auth/application/token \\
  -H "apiKey: mt_key_..." \\
  -H "apiSecret: mt_secret_..."`,
          },
          {
            label: 'Resposta 200',
            language: 'json',
            code: `{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}`,
          },
        ],
      },
      {
        title: 'Regras',
        bullets: [
          'App precisa estar active. Senão, 401 APPLICATION_AUTHENTICATION_FAILED (mensagem genérica).',
          'Credencial errada também é 401 genérico — não distingue key de secret.',
          'Throttle: 10 tentativas / 15 min por apiKey e 30 / 15 min por IP. Depois 429 RATE_LIMIT_EXCEEDED.',
          'TTL = jwtExpirationInMinutes da app, senão o global (15 min).',
          'O JWT traz groups=["APPLICATION"], sub=appId, claims app_id, app_name e token_type=access.',
        ],
      },
      {
        title: 'Usar o token',
        paragraphs: [
          'Authorization: Bearer <accessToken> nas rotas APPLICATION: criar/desativar user, girar secret da própria app.',
        ],
      },
      {
        title: 'Rotacionar o secret',
        table: {
          headers: ['Quem', 'Rota'],
          rows: [
            ['OWNER writer nesta app', 'PATCH /api/v1/client-applications/{appId}/rotate-secret'],
            ['APPLICATION', 'PATCH /api/v1/client-applications/rotate-secret'],
          ],
        },
        callout: {
          tone: 'warn',
          title: 'O secret antigo para na hora',
          body: 'A resposta 200 inclui o novo apiSecret uma única vez. Atualize o secret store do backend antes de derrubar o processo antigo.',
        },
      },
    ],
  },

  users: {
    kicker: 'Contrato',
    title: 'Usuários da sua aplicação',
    lead: 'Criar, listar e desativar exige JWT APPLICATION. O user autenticado lê e edita a própria conta (nome, e-mail, senha). Senha nunca volta no JSON.',
    sections: [
      {
        title: 'Criar user',
        endpoint: { method: 'POST', path: '/api/v1/users/create', auth: 'APPLICATION' },
        paragraphs: [
          'appId vem do JWT. Campos obrigatórios de verdade são os de requiredUserFields da app. Lista vazia = o DTO não exige name/email/password.',
        ],
        fields: [
          { name: 'name', required: false, notes: 'Obrigatório se requiredUserFields inclui NAME' },
          { name: 'username', required: false, notes: 'Único por app (case-insensitive). USERNAME no required.' },
          { name: 'email', required: false, notes: 'string[]. Primeiro = primary. EMAIL no required.' },
          { name: 'password', required: false, notes: 'Política 8–72, Aa, número, especial + HIBP. PASSWORD no required.' },
          { name: 'phones', required: false, notes: '[{ phoneNumber }]. PHONE no required.' },
          { name: 'document', required: false, notes: 'cpf, rg, cnpj, passport, ssn, nif… DOCUMENT no required = ao menos um preenchido' },
          { name: 'maritalStatus', required: false, notes: 'SINGLE | MARRIED | DIVORCED | WIDOWED | UNKNOWN' },
          { name: 'roles', required: false, notes: 'Nomes de papéis já criados nesta app (ex.: ADMIN). Reservados do IdP → 400.' },
        ],
        code: {
          language: 'json',
          code: `{
  "name": "Jane Doe",
  "username": "jane",
  "email": ["jane@example.com"],
  "password": "StrongPassword123!",
  "phones": [{ "phoneNumber": "+5521999999999" }],
  "document": { "cpf": "12345678900" },
  "maritalStatus": "SINGLE",
  "roles": ["ADMIN"]
}`,
        },
        callout: {
          tone: 'info',
          title: '201 sem senha',
          body: 'UserResponseDto: userId, appId, name, username, emails[], phones[], document, maritalStatus, images, addresses, roleIds[], createdAt, updatedAt, disabledAt, active. Nunca password nem tokens. E-mail duplicado no mesmo app → 409 EMAIL_ALREADY_EXISTS. Username duplicado → 409 USERNAME_ALREADY_EXISTS.',
        },
      },
      {
        title: 'requiredUserFields',
        paragraphs: [
          'Enum: NAME, USERNAME, EMAIL, PASSWORD, PHONE, DOCUMENT, MARITAL_STATUS. No Google, PASSWORD é ignorado; os outros exigidos precisam ir no body do google-token.',
        ],
        table: {
          headers: ['Como configurar', 'Rota', 'Auth'],
          rows: [
            ['No create da app', 'POST /api/v1/client-applications/create', 'OWNER'],
            ['Settings (parcial)', 'PATCH /api/v1/client-applications/settings', 'OWNER writer'],
            ['Atalho', 'PATCH /api/v1/client-applications/required-user-fields', 'OWNER writer · body { appId, requiredUserFields } · 204'],
          ],
        },
      },
      {
        title: 'Ler, editar e cortar sessão',
        table: {
          headers: ['Método', 'Rota', 'Auth', 'Notas'],
          rows: [
            ['GET', '/api/v1/users', 'APPLICATION', 'Lista todos os users da app do JWT'],
            ['GET', '/api/v1/users/me', 'USER', 'O próprio, pelo access token'],
            ['PATCH', '/api/v1/users/me', 'USER', 'Parcial: name, email, currentPassword, newPassword'],
            ['GET', '/api/v1/users/{userId}', 'APPLICATION (mesmo app) ou o próprio USER', 'Outro userId com token USER → 403'],
            ['PATCH', '/api/v1/users/{userId}/disable', 'APPLICATION', 'Revoga refresh desse user. 200 com o DTO'],
            ['PATCH', '/api/v1/users/{userId}/enable', 'APPLICATION', '200'],
          ],
        },
        paragraphs: [
          'PATCH /me: e-mail novo precisa ser único na app (409 EMAIL_ALREADY_EXISTS). Trocar e-mail desfaz a verificação e dispara o e-mail de confirmação. Trocar senha exige política + HIBP; se o user já tem senha, currentPassword é obrigatório (400 se faltar, 401 se estiver errada). Conta só-Google pode definir newPassword sem currentPassword. Senha nova revoga os refresh daquele user.',
        ],
      },
      {
        title: 'Endereço',
        paragraphs: [
          'PATCH /api/v1/users/{userId}/address anexa um endereço completo. Não chama ViaCEP. country só BR, US, PT ou ID. Obrigatórios: country, zipCode, street, number, city, state. Opcionais: complement, neighborhood, rt, rw, kelurahan, kecamatan. Auth: APPLICATION | USER (próprio). 200 com o user.',
          'DELETE /api/v1/users/{userId}/address/{addressIndex} — índice 0-based. 204.',
        ],
      },
      {
        title: 'Imagens',
        paragraphs: [
          'POST multipart /api/v1/users/{userId}/images/{imageType} campo image. Auth: APPLICATION | USER. Content-Type tem que começar com image/. Substitui a imagem do mesmo tipo. 200 com o user.',
          'DELETE /api/v1/users/{userId}/images/{imageType} — 204. Tipo inexistente → 400.',
          'imageType: PROFILE, DOCUMENT_FRONT, DOCUMENT_BACK, SELFIE_KYC, PROOF_OF_ADDRESS, OTHER.',
        ],
      },
    ],
  },

  'user-auth': {
    kicker: 'Contrato',
    title: 'Login, refresh e logout de users',
    lead: 'Access curto. Refresh no JSON (não em cookie). Cada refresh rotaciona o par e invalida o jti anterior. A sua app implementa o retry no 401 — o IdP não faz isso sozinho.',
    sections: [
      {
        title: 'Login com senha',
        endpoint: { method: 'POST', path: '/api/v1/auth/users/token', auth: 'público' },
        callout: {
          tone: 'warn',
          title: 'appId é header',
          body: 'Não envie appId no JSON. Body: só email e password. Sem o header a validação falha e o CORS da sua origin também não fecha na app.',
        },
        fields: [
          { name: 'appId', required: true, notes: 'Header' },
          { name: 'email', required: true, notes: 'Body' },
          { name: 'password', required: true, notes: 'Body' },
        ],
        codeTabs: [
          {
            label: 'Request',
            language: 'bash',
            code: `POST /api/v1/auth/users/token
Content-Type: application/json
appId: 507f1f77bcf86cd799439011

{
  "email": "jane@example.com",
  "password": "StrongPassword123!"
}`,
          },
          {
            label: '200',
            language: 'json',
            code: `{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "refreshTokenExpiresIn": 2592000
}`,
          },
        ],
      },
      {
        title: 'O que bloqueia o login por senha',
        bullets: [
          'E-mail não verificado → 403 EMAIL_NOT_VERIFIED.',
          'User desativado → 403 ACCOUNT_DISABLED.',
          'E-mail/senha errados, user inexistente nesse appId → 401 APPLICATION_AUTHENTICATION_FAILED (genérico).',
          'Throttle: 10 / 15 min na chave {appId}:{email} e 30 / 15 min por IP. Intervalo mínimo 1s. Estouro → 429 RATE_LIMIT_EXCEEDED.',
        ],
      },
      {
        title: 'Refresh',
        endpoint: { method: 'POST', path: '/api/v1/auth/users/refresh', auth: 'REFRESH_TOKEN' },
        paragraphs: [
          'Authorization: Bearer <refreshToken>. O group do JWT é REFRESH_TOKEN, não USER. Não use o access nestas rotas.',
          'Resposta 200: o mesmo shape do login (access + refresh novos). O jti antigo é revogado.',
        ],
        code: {
          language: 'bash',
          code: `curl -X POST ${BASE}/api/v1/auth/users/refresh \\
  -H "Authorization: Bearer REFRESH_JWT"`,
        },
      },
      {
        title: 'Logout',
        endpoint: { method: 'POST', path: '/api/v1/auth/users/logout', auth: 'REFRESH_TOKEN' },
        paragraphs: [
          'Authorization: Bearer <refreshToken> → 204. Revoga só esse jti. Passa mesmo com user desativado, para encerrar a sessão.',
        ],
      },
      {
        title: 'Sessão no seu front',
        steps: [
          'Guarde accessToken e refreshToken (sessionStorage reduz a janela; XSS ainda lê). Não use cookie httpOnly — a API devolve JSON.',
          'Em toda chamada autenticada: Authorization: Bearer <access> e header appId nas rotas públicas que precisam de CORS da app.',
          'No 401 do access, chame /refresh uma vez e repita o request. Se o refresh falhar, limpe a sessão e mande para o login.',
        ],
      },
    ],
  },

  google: {
    kicker: 'Contrato',
    title: 'Login Google',
    lead: 'O IdP valida o ID token localmente (JWKS, iss, assinatura, exp, email_verified) e a audience. User pode ser provisionado. Owner Google precisa já existir.',
    sections: [
      {
        title: 'Users',
        endpoint: { method: 'POST', path: '/api/v1/auth/users/google-token', auth: 'público' },
        paragraphs: [
          'appId vai no body (diferente do login por senha). No browser, mande também o header appId para o CORS resolver a app.',
          'Se o e-mail ainda não existe naquele appId, a conta é criada. requiredUserFields valem, menos PASSWORD. Google marca o e-mail como verificado.',
          'App inativa → 401 APPLICATION_AUTHENTICATION_FAILED. Sem googleAudience na app, cai no fallback app.mt.id.google.user.audience do servidor; se a audience do token não bater, 401 genérico.',
        ],
        fields: [
          { name: 'idToken', required: true, notes: 'Google ID token' },
          { name: 'appId', required: true, notes: 'Body' },
          { name: 'nonce', required: false, notes: 'Validado se enviado' },
          { name: 'name, username, phones, document, maritalStatus', required: false, notes: 'Usados no provision se a app exigir' },
        ],
        code: {
          language: 'json',
          code: `{
  "idToken": "eyJ...",
  "appId": "507f1f77bcf86cd799439011",
  "nonce": "optional-nonce",
  "name": "Jane Doe",
  "username": "jane",
  "phones": [{ "phoneNumber": "+5521999999999" }],
  "document": { "cpf": "12345678900" }
}`,
        },
        callout: {
          tone: 'warn',
          title: 'googleAudience',
          body: 'Grave o Client ID OAuth da sua aplicação em googleAudience (settings da app). O ID token do user precisa ter sido emitido para esse Client ID.',
        },
      },
      {
        title: 'Owners',
        endpoint: { method: 'POST', path: '/api/v1/auth/owners/google-token', auth: 'público' },
        paragraphs: [
          'Body: { idToken, nonce? }. Não cria owner. Audience é a do MT ID (app.mt.id.google.owner.audience), não a da client application. Se o e-mail do Google ainda não estava verificado no MT ID, o login marca como verificado.',
        ],
        code: {
          language: 'json',
          code: `{ "idToken": "eyJ...", "nonce": "optional-nonce" }`,
        },
      },
    ],
  },

  cors: {
    kicker: 'Browser',
    title: 'CORS, appId e tokens no front',
    lead: 'Quarkus CORS está desligado. TenantCorsFilter libera a Origin só se for a da plataforma ou se pertencer à app da request.',
    sections: [
      {
        title: 'Quando a Origin passa',
        bullets: [
          'É exatamente a origin da plataforma (default http://localhost:3000), ou',
          'É uma das allowedOrigins da app ativa resolvida pelo appId.',
        ],
        paragraphs: [
          'Cache das origins da app: 60s. Origins são normalizadas (trim, sem barra no fim, lowercase). App inativa: origins dela não passam.',
        ],
      },
      {
        title: 'Como o appId é resolvido',
        steps: [
          'Header appId',
          'Query ?appId=',
          'Claim app_id do JWT em Authorization (decode do payload, sem verificar assinatura — só para CORS)',
        ],
        callout: {
          tone: 'info',
          title: 'Sem appId = só o console',
          body: 'Se o filtro não achar appId, origens de client applications não entram. Por isso o login de user no browser precisa do header mesmo quando o body já teria o id (Google).',
        },
      },
      {
        title: 'Preflight',
        paragraphs: [
          'Access-Control-Allow-Headers: Content-Type, Authorization, Accept, apiKey, apiSecret, appId. Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS. Credentials: true. OPTIONS → 204. Max-Age: 3600. Vary: Origin.',
        ],
        code: {
          language: 'javascript',
          code: `await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    appId: APP_ID,
    Authorization: accessToken ? \`Bearer \${accessToken}\` : undefined,
  },
});`,
        },
      },
      {
        title: 'Tokens no browser da sua app',
        bullets: [
          'Access de user: jwtExpirationInMinutes da app (padrão 15 min). Refresh: refreshTokenExpirationInDays da app (padrão 30 dias).',
          'Refresh vem no JSON. Você implementa o POST /auth/users/refresh no 401. O interceptor automático deste console é só da sessão OWNER.',
          'apiKey e apiSecret nunca no browser.',
        ],
      },
    ],
  },

  routes: {
    kicker: 'Referência',
    title: 'Índice de rotas',
    lead: 'Todas as rotas HTTP do IdP. Auth é o group JWT, salvo “público”. Writer/viewer de owner é checado no serviço, por app — o JWT do owner é só OWNER.',
    sections: [
      {
        title: 'Auth da aplicação',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['POST', '/api/v1/auth/application/token', 'público · headers apiKey, apiSecret'],
          ],
        },
      },
      {
        title: 'Auth de users',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['POST', '/api/v1/auth/users/token', 'público · header appId · body { email, password }'],
            ['POST', '/api/v1/auth/users/google-token', 'público · body { idToken, appId, … } · header appId no browser'],
            ['POST', '/api/v1/auth/users/refresh', 'REFRESH_TOKEN'],
            ['POST', '/api/v1/auth/users/logout', 'REFRESH_TOKEN · 204'],
          ],
        },
      },
      {
        title: 'Auth de owners',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['POST', '/api/v1/auth/owners/token', 'público · { email, password }'],
            ['POST', '/api/v1/auth/owners/google-token', 'público · { idToken, nonce? }'],
            ['POST', '/api/v1/auth/owners/refresh', 'REFRESH_TOKEN'],
            ['POST', '/api/v1/auth/owners/logout', 'REFRESH_TOKEN · 204'],
          ],
        },
      },
      {
        title: 'Users',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['POST', '/api/v1/users/create', 'APPLICATION · 201'],
            ['GET', '/api/v1/users', 'APPLICATION'],
            ['GET', '/api/v1/users/me', 'USER'],
            ['PATCH', '/api/v1/users/me', 'USER · name / email / senha'],
            ['GET', '/api/v1/users/{userId}', 'APPLICATION | USER (próprio)'],
            ['PATCH', '/api/v1/users/{userId}/disable', 'APPLICATION'],
            ['PATCH', '/api/v1/users/{userId}/enable', 'APPLICATION'],
            ['POST', '/api/v1/users/{userId}/email/verification/send', 'APPLICATION | USER'],
            ['GET', '/api/v1/users/email/verify', 'público · ?token= · 204'],
            ['POST', '/api/v1/users/password/forgot', 'público · { email, appId } · sempre 204'],
            ['POST', '/api/v1/users/password/reset', 'público · { token, newPassword } · 204'],
            ['PATCH', '/api/v1/users/{userId}/address', 'APPLICATION | USER'],
            ['DELETE', '/api/v1/users/{userId}/address/{addressIndex}', 'APPLICATION | USER · 204'],
            ['POST', '/api/v1/users/{userId}/images/{imageType}', 'APPLICATION | USER · multipart'],
            ['DELETE', '/api/v1/users/{userId}/images/{imageType}', 'APPLICATION | USER · 204'],
          ],
        },
      },
      {
        title: 'Owners',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['POST', '/api/v1/owner/create', 'público · 201'],
            ['GET', '/api/v1/owner/me', 'OWNER'],
            ['PATCH', '/api/v1/owner/me', 'OWNER'],
            ['PATCH', '/api/v1/owner/me/address', 'OWNER'],
            ['DELETE', '/api/v1/owner/me/address/{addressIndex}', 'OWNER · 204'],
            ['POST', '/api/v1/owner/me/images/{imageType}', 'OWNER · multipart'],
            ['DELETE', '/api/v1/owner/me/images/{imageType}', 'OWNER · 204'],
            ['POST', '/api/v1/owner/{ownerId}/email/verification/send', 'OWNER (próprio ou writer numa app em comum)'],
            ['GET', '/api/v1/owner/email/verify', 'público · ?token= · 204'],
            ['POST', '/api/v1/owner/password/forgot', 'público · { email } · sempre 204'],
            ['POST', '/api/v1/owner/password/reset', 'público · { token, newPassword } · 204'],
          ],
        },
      },
      {
        title: 'Client applications',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['GET', '/api/v1/client-applications', 'OWNER · só as apps das quais é membro'],
            ['GET', '/api/v1/client-applications/{appId}', 'OWNER membro'],
            ['POST', '/api/v1/client-applications/create', 'OWNER · 201 com apiSecret'],
            ['PATCH', '/api/v1/client-applications/settings', 'OWNER writer · body inclui appId'],
            ['PATCH', '/api/v1/client-applications/required-user-fields', 'OWNER writer · 204'],
            ['PATCH', '/api/v1/client-applications/{appId}/disable', 'OWNER writer'],
            ['PATCH', '/api/v1/client-applications/{appId}/enable', 'OWNER writer'],
            ['PATCH', '/api/v1/client-applications/{appId}/rotate-secret', 'OWNER writer · devolve secret'],
            ['PATCH', '/api/v1/client-applications/rotate-secret', 'APPLICATION · devolve secret'],
            ['PATCH', '/api/v1/client-applications/add-owner', 'OWNER writer · 204'],
            ['PATCH', '/api/v1/client-applications/{appId}/owners/{ownerId}', 'OWNER writer · { role }'],
            ['DELETE', '/api/v1/client-applications/{appId}/owners/{ownerId}', 'OWNER writer'],
          ],
        },
      },
      {
        title: 'Papéis de user',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['POST', '/api/v1/user-roles/app/{appId}/create', 'OWNER writer · { roleName }'],
            ['GET', '/api/v1/user-roles/app/{appId}', 'OWNER membro'],
            ['GET', '/api/v1/user-roles/{userRoleId}', 'OWNER membro da app do papel'],
            ['PATCH', '/api/v1/user-roles/app/{appId}/update', 'OWNER writer · { userRoleId, roleName }'],
            ['DELETE', '/api/v1/user-roles/{userRoleId}', 'OWNER writer · 204'],
          ],
        },
      },
      {
        title: 'Endereços e páginas de e-mail',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['GET', '/api/v1/addresses/br/{zipCode}', 'público'],
            ['GET', '/api/v1/addresses/id/{zipCode}', 'público'],
            ['GET', '/api/v1/addresses/us/{zipCode}', 'público'],
            ['GET', '/api/v1/addresses/pt/{zipCode}', 'público'],
            ['GET', '/api/v1/email/users/verify', 'público · HTML'],
            ['GET', '/api/v1/email/owners/verify', 'público · HTML'],
            ['GET / POST', '/api/v1/email/users/reset-password', 'público · HTML / form'],
            ['GET / POST', '/api/v1/email/owners/reset-password', 'público · HTML / form'],
          ],
        },
      },
    ],
  },

  jwt: {
    kicker: 'Referência',
    title: 'JWT, groups e claims',
    lead: 'Issuer mt-id. token_type distingue access e refresh. expiresIn na resposta HTTP está em segundos.',
    sections: [
      {
        title: 'Groups',
        table: {
          headers: ['Grupo', 'Quem usa'],
          rows: [
            ['OWNER', 'Conta do console. Writer/viewer não entra neste JWT.'],
            ['APPLICATION', 'Backend da client app'],
            ['USER', 'User final (+ papéis custom no mesmo access)'],
            ['REFRESH_TOKEN', 'Só /refresh e /logout'],
          ],
        },
        paragraphs: [
          'Nomes reservados — não crie user role com eles: USER, APPLICATION, REFRESH_TOKEN, OWNER, OWNER_WRITER, OWNER_VIEWER. Papéis custom entram em groups e no claim roles (sem o USER).',
        ],
      },
      {
        title: 'User access',
        table: {
          headers: ['Claim', 'Valor'],
          rows: [
            ['sub', 'userId'],
            ['upn', 'e-mail do login'],
            ['groups', '["USER", ...custom]'],
            ['userId / app_id / name / emailVerified', 'espelho da conta'],
            ['roles', 'só papéis custom'],
            ['token_type', 'access'],
          ],
        },
      },
      {
        title: 'Application access',
        bullets: ['sub = appId', 'groups = ["APPLICATION"]', 'app_id, app_name, token_type=access', 'sem refresh'],
      },
      {
        title: 'Owner access',
        bullets: [
          'sub = ownerId, groups = ["OWNER"]',
          'claims: ownerId, name, emailVerified, token_type=access, upn',
          'OWNER_WRITER e OWNER_VIEWER não vão no JWT — estão em client-application.owners[].role, por app.',
        ],
      },
      {
        title: 'Refresh',
        bullets: [
          'groups = ["REFRESH_TOKEN"], token_type = refresh, jti = id interno (hasheado no banco).',
          'Owner refresh carrega ownerId; user refresh carrega userId e app_id.',
          'TTL owner: global 15 min access / 30 dias refresh (não usa settings da app).',
          'TTL user: jwtExpirationInMinutes e refreshTokenExpirationInDays da app; senão o global.',
        ],
      },
    ],
  },

  applications: {
    kicker: 'Referência',
    title: 'Client applications',
    lead: 'CRUD no console do owner. apiSecret só no create e no rotate. GET nunca devolve secret. Qualquer owner autenticado cria uma app e vira OWNER_WRITER nela.',
    sections: [
      {
        title: 'Listar e ler',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['GET', '/api/v1/client-applications', 'OWNER — só apps das quais é membro'],
            ['GET', '/api/v1/client-applications/{appId}', 'OWNER membro (writer ou viewer)'],
          ],
        },
        paragraphs: [
          'A resposta hidrata owners[] com perfil (name, email, phone, images, active) + role daquela app.',
        ],
      },
      {
        title: 'Criar',
        endpoint: { method: 'POST', path: '/api/v1/client-applications/create', auth: 'OWNER' },
        fields: [
          { name: 'name', required: true, notes: '' },
          { name: 'ownerId', required: true, notes: 'Tem que ser o owner autenticado. Senão 403.' },
          { name: 'jwtExpirationInMinutes', required: true, notes: 'Positive. Access da app (APPLICATION) e dos users desta app.' },
          { name: 'refreshTokenExpirationInDays', required: true, notes: 'Positive. Só refresh de user desta app. Owner usa o TTL global.' },
          { name: 'allowedOrigins', required: true, notes: 'Lista não vazia' },
          { name: 'description / logoUrl / googleAudience / emailSettings / requiredUserFields', required: false, notes: 'requiredUserFields default []' },
        ],
      },
      {
        title: 'Settings e ciclo de vida',
        paragraphs: ['Write (settings, disable, enable, rotate, time, required fields) exige OWNER_WRITER nesta app. Viewer lê e toma 403 no write.'],
        table: {
          headers: ['Método', 'Rota', 'Notas'],
          rows: [
            ['PATCH', '/settings', 'Parcial. Body inclui appId. allowedOrigins, se enviado, não pode ser vazio. 200 sem secret'],
            ['PATCH', '/required-user-fields', 'Body { appId, requiredUserFields }. 204'],
            ['PATCH', '/{appId}/disable', 'active=false. Revoga refresh de users. JWT APPLICATION e USER recusados na próxima request. Login senha/Google/APPLICATION → 401'],
            ['PATCH', '/{appId}/enable', 'Reativa'],
            ['PATCH', '/{appId}/rotate-secret', 'Writer. Devolve secret novo'],
            ['PATCH', '/rotate-secret', 'APPLICATION. Devolve secret novo'],
            ['PATCH', '/add-owner', 'Body: appId + ownerIds e/ou emails + role opcional (default OWNER_VIEWER). 204'],
            ['PATCH', '/{appId}/owners/{ownerId}', 'Body { role }. Não rebaixa o último writer'],
            ['DELETE', '/{appId}/owners/{ownerId}', 'Não remove o último owner nem o último writer'],
          ],
        },
      },
      {
        title: 'emailSettings',
        paragraphs: [
          'fromEmail, fromName, replyTo, supportEmail, supportUrl, verificationRedirectUrl, passwordResetRedirectUrl, loginUrl.',
          'Redirects precisam casar com allowedOrigins. Esquema https, ou http em localhost / 127.0.0.1. Sem URL válida, o e-mail aponta para as páginas HTML do IdP.',
        ],
      },
    ],
  },

  owners: {
    kicker: 'Referência',
    title: 'Owners da plataforma',
    lead: 'Owner é a conta do console MT ID. Signup público; o 1º já entra com e-mail verificado. Writer e viewer não ficam neste cadastro — acompanham cada aplicação.',
    sections: [
      {
        title: 'Login do console',
        endpoint: { method: 'POST', path: '/api/v1/auth/owners/token', auth: 'público' },
        paragraphs: [
          'Body: { email, password }. E-mail verificado, conta active. Throttle por e-mail (10 / 15 min) e por IP (30 / 15 min). Resposta igual à de user (access + refresh). TTL é o global, não o de uma app.',
        ],
        code: {
          language: 'json',
          code: `{ "email": "owner@empresa.com", "password": "StrongPassword123!" }`,
        },
      },
      {
        title: 'Sessão',
        table: {
          headers: ['Rota', 'Auth', 'Notas'],
          rows: [
            ['POST /api/v1/auth/owners/refresh', 'REFRESH_TOKEN', 'Rotaciona o par'],
            ['POST /api/v1/auth/owners/logout', 'REFRESH_TOKEN', '204'],
            ['POST /api/v1/auth/owners/google-token', 'público', 'Não cria owner. Ver página Google.'],
          ],
        },
      },
      {
        title: 'Criar owner',
        endpoint: { method: 'POST', path: '/api/v1/owner/create', auth: 'público' },
        paragraphs: [
          'Sem limite de quantidade. Não existe campo role neste body: o papel é definido ao adicionar o owner na app. 201.',
        ],
        fields: [
          { name: 'name / email / phoneNumber / password', required: true, notes: 'password na política + HIBP' },
          { name: 'document', required: true, notes: 'Objeto obrigatório; cpf etc. opcionais dentro' },
          { name: 'address', required: true, notes: 'Mesmo body de PATCH /me/address. Lookup: GET /addresses/{br|us|pt|id}/{zip}' },
        ],
      },
      {
        title: 'Perfil',
        table: {
          headers: ['Rota', 'Auth', 'Notas'],
          rows: [
            ['GET /api/v1/owner/me', 'OWNER', 'Perfil (images, addresses). Sem role de app.'],
            ['PATCH /api/v1/owner/me', 'OWNER', 'name, phoneNumber, document'],
            ['PATCH /api/v1/owner/me/address', 'OWNER', 'Anexa. O primeiro já entra no create.'],
            ['DELETE /api/v1/owner/me/address/{index}', 'OWNER', '204'],
            ['POST /api/v1/owner/me/images/{imageType}', 'OWNER', 'multipart campo image. imageType: mesmo enum do user.'],
            ['DELETE /api/v1/owner/me/images/{imageType}', 'OWNER', '204'],
          ],
        },
      },
      {
        title: 'E-mail e senha',
        table: {
          headers: ['Rota', 'Auth', 'Notas'],
          rows: [
            ['POST /api/v1/owner/{ownerId}/email/verification/send', 'OWNER', 'Próprio, ou writer numa app em que o alvo também é membro. Body { email }.'],
            ['GET /api/v1/owner/email/verify?token=', 'público', '204'],
            ['GET /api/v1/email/owners/verify?token=', 'público', 'Página HTML'],
            ['POST /api/v1/owner/password/forgot', 'público', '{ email }. Sempre 204'],
            ['POST /api/v1/owner/password/reset', 'público', '{ token, newPassword }. 204'],
            ['GET/POST /api/v1/email/owners/reset-password', 'público', 'Form HTML'],
          ],
        },
      },
    ],
  },

  roles: {
    kicker: 'Referência',
    title: 'Papéis de user',
    lead: 'Papéis da sua app, não do IdP. O nome é trim + uppercase. Entram no JWT do user em groups e no claim roles.',
    sections: [
      {
        title: 'Contrato',
        table: {
          headers: ['Método', 'Rota', 'Auth'],
          rows: [
            ['POST', '/api/v1/user-roles/app/{appId}/create', 'OWNER writer — body { roleName }'],
            ['GET', '/api/v1/user-roles/app/{appId}', 'OWNER membro'],
            ['GET', '/api/v1/user-roles/{userRoleId}', 'OWNER membro da app do papel'],
            ['PATCH', '/api/v1/user-roles/app/{appId}/update', 'OWNER writer — { userRoleId, roleName }'],
            ['DELETE', '/api/v1/user-roles/{userRoleId}', 'OWNER writer — 204'],
          ],
        },
        code: {
          language: 'json',
          code: `{ "userRoleId": "…", "appId": "…", "roleName": "ADMIN" }`,
        },
        callout: {
          tone: 'warn',
          title: 'Reservados',
          body: 'USER, APPLICATION, REFRESH_TOKEN, OWNER, OWNER_WRITER, OWNER_VIEWER → 400. Duplicata → 409 USER_ROLE_ALREADY_EXISTS. No create de user, roles[] são nomes que já existem nesta app; a API grava roleIds.',
        },
      },
    ],
  },

  emails: {
    kicker: 'Fluxos',
    title: 'Verificação de e-mail e reset de senha',
    lead: 'O MT ID envia os e-mails. Tokens vão hasheados no banco, valem pouco tempo e são de uso único.',
    sections: [
      {
        title: 'TTL',
        table: {
          headers: ['Token', 'TTL'],
          rows: [
            ['Verificação de e-mail', '30 min'],
            ['Reset de senha', '15 min'],
          ],
        },
      },
      {
        title: 'User',
        table: {
          headers: ['Ação', 'Rota'],
          rows: [
            ['Reenviar verificação', 'POST /api/v1/users/{userId}/email/verification/send  { email }  APPLICATION | USER'],
            ['Confirmar (API)', 'GET /api/v1/users/email/verify?token=  público  204'],
            ['Página HTML', 'GET /api/v1/email/users/verify?token='],
            ['Forgot', 'POST /api/v1/users/password/forgot  { email, appId }  sempre 204'],
            ['Reset API', 'POST /api/v1/users/password/reset  { token, newPassword }  204'],
            ['Form HTML', 'GET/POST /api/v1/email/users/reset-password'],
          ],
        },
      },
      {
        title: 'Owner',
        table: {
          headers: ['Ação', 'Rota'],
          rows: [
            ['Reenviar verificação', 'POST /api/v1/owner/{ownerId}/email/verification/send  { email }'],
            ['Confirmar (API)', 'GET /api/v1/owner/email/verify?token='],
            ['Página HTML', 'GET /api/v1/email/owners/verify?token='],
            ['Forgot', 'POST /api/v1/owner/password/forgot  { email }  sempre 204'],
            ['Reset API', 'POST /api/v1/owner/password/reset  { token, newPassword }'],
            ['Form HTML', 'GET/POST /api/v1/email/owners/reset-password'],
          ],
        },
      },
      {
        title: 'Redirect para a sua app',
        paragraphs: [
          'Se verificationRedirectUrl / passwordResetRedirectUrl tiverem origin em allowedOrigins (https, ou http em localhost/127.0.0.1), o e-mail aponta para lá com ?token=. No reset, seu front faz POST /api/v1/users/password/reset. loginUrl entra nos templates.',
          'Sem URL válida, o usuário cai nas páginas HTML do IdP. Owner sempre usa as páginas /api/v1/email/owners/… (não tem redirect de client application).',
        ],
      },
      {
        title: 'Forgot é silencioso',
        paragraphs: [
          'Sempre 204, mesmo se o e-mail não existe, a conta está desativada ou o throttle estourou (5 / hora, intervalo mínimo 30s). Não use a resposta para enumerar contas.',
        ],
        code: {
          language: 'json',
          code: `{ "email": "jane@example.com", "appId": "507f1f77bcf86cd799439011" }`,
        },
      },
    ],
  },

  errors: {
    kicker: 'Referência',
    title: 'Erros, senha e limites',
    lead: 'Erros de domínio: JSON com errorCode, message, status, path, timestamp, origin. origin é MT ID ou o provedor externo (ViaCEP, KodePos, Zippopotam). Bean Validation (campo em branco) pode voltar 400 do JAX-RS sem esse envelope.',
    sections: [
      {
        title: 'Formato',
        code: {
          language: 'json',
          code: `{
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "status": 429,
  "path": "/api/v1/auth/users/token",
  "timestamp": "2026-08-15T14:00:00",
  "origin": "MT ID"
}`,
        },
      },
      {
        title: 'Códigos',
        table: {
          headers: ['errorCode', 'HTTP', 'Quando'],
          rows: [
            ['APPLICATION_AUTHENTICATION_FAILED', '401', 'Credencial, Google, token inválido, app inativa no Google login'],
            ['APPLICATION_FORBIDDEN', '403', 'App/user/owner fora do escopo, viewer tentando write'],
            ['FORBIDDEN', '403', 'Genérico'],
            ['EMAIL_NOT_VERIFIED', '403', 'Login senha com e-mail pendente'],
            ['ACCOUNT_DISABLED', '403', 'User desativado (ou owner.active=false no banco). App inativa não usa este código no login.'],
            ['WEAK_PASSWORD', '400', 'Política: 8–72, Aa, número, especial'],
            ['PASSWORD_COMPROMISED', '400', 'Senha no HIBP'],
            ['REQUIRED_USER_FIELD_MISSING', '400', 'Campo exigido pela app. A message cita o campo'],
            ['INVALID_OR_EXPIRED_TOKEN', '400', 'Verify / reset'],
            ['EMAIL_ALREADY_EXISTS', '409', 'E-mail já usado neste app (user) ou na plataforma (owner)'],
            ['USERNAME_ALREADY_EXISTS', '409', 'Username já usado neste app'],
            ['EMAIL_ALREADY_VERIFIED', '409', 'Reenvio de verificação sem necessidade'],
            ['USER_ROLE_ALREADY_EXISTS', '409', 'Nome de papel duplicado na app'],
            ['OWNER_NOT_FOUND / USER_NOT_FOUND / CLIENT_APPLICATION_NOT_FOUND / USER_ROLE_NOT_FOUND', '404', ''],
            ['RATE_LIMIT_EXCEEDED', '429', 'Login, token de app, reenvio de verificação, CEP. Forgot estoura e ainda assim 204.'],
            ['VIACEP_INVALID_CEP', '400', ''],
            ['VIACEP_NOT_FOUND', '422', ''],
            ['KODEPOS_ZIP_NOT_FOUND / ZIPPOPOTAM_ZIP_NOT_FOUND', '404', ''],
            ['VIACEP_API_UNAVAILABLE / KODEPOS_API_UNAVAILABLE / ZIPPOPOTAM_API_UNAVAILABLE', '503', ''],
          ],
        },
      },
      {
        title: 'Senha',
        bullets: [
          'Mínimo 8, máximo 72, maiúscula, minúscula, número e caractere especial.',
          'HIBP ligado por padrão. fail-open true: se a API HIBP cair, a senha passa.',
          'Vale em create de user/owner e nos resets (API e HTML).',
        ],
      },
      {
        title: 'Throttle',
        table: {
          headers: ['Ação', 'Chave', 'Limite'],
          rows: [
            ['Login owner', 'e-mail', '10 / 15 min, intervalo 1s'],
            ['Login user', '{appId}:{email}', '10 / 15 min, intervalo 1s'],
            ['Login IP', 'IP', '30 / 15 min'],
            ['Token APPLICATION', 'apiKey / IP', '10 e 30 / 15 min'],
            ['Reenvio de verificação', '{id}:{email}', '5 / 1 h, intervalo 30s'],
            ['Forgot password', 'email (owner) ou {email}:{appId} (user)', '5 / 1 h, 30s — estouro ainda responde 204'],
            ['Lookup de endereço', 'IP', '30 / 1 min'],
          ],
        },
      },
    ],
  },

  addresses: {
    kicker: 'Utilitário',
    title: 'Lookup de endereço',
    lead: 'Público, 30 chamadas por IP por minuto. Use no formulário. Anexar ao user/owner é outro endpoint e não chama ViaCEP.',
    sections: [
      {
        title: 'Consultar',
        table: {
          headers: ['País', 'Rota', 'Query'],
          rows: [
            ['BR · ViaCEP', 'GET /api/v1/addresses/br/{zipCode}', 'number e complement opcionais'],
            ['ID · KodePos', 'GET /api/v1/addresses/id/{zipCode}', 'street, number, rt, rw obrigatórios; complement opcional'],
            ['US · Zippopotam', 'GET /api/v1/addresses/us/{zipCode}', 'street e number obrigatórios; complement opcional'],
            ['PT · Zippopotam', 'GET /api/v1/addresses/pt/{zipCode}', 'street e number obrigatórios; complement opcional'],
          ],
        },
        code: {
          language: 'bash',
          code: `curl "${BASE}/api/v1/addresses/br/01310100?number=157"`,
        },
      },
      {
        title: 'Resposta',
        code: {
          language: 'json',
          code: `{
  "country": "BR",
  "zipCode": "01310-100",
  "street": "Avenida Paulista",
  "number": "157",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "state": "SP"
}`,
        },
      },
      {
        title: 'Gravar',
        paragraphs: [
          'User: PATCH /api/v1/users/{userId}/address (APPLICATION | USER). Owner: PATCH /api/v1/owner/me/address (OWNER). Envia o endereço completo. country só BR, US, PT, ID. Anexa na lista. DELETE …/address/{addressIndex} remove pelo índice 0-based.',
        ],
      },
    ],
  },
}
