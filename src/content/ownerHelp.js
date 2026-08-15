export const ownerHelp = {
  name: 'Nome da aplicação no console. Não aparece para o user final, a menos que você copie isso no from name dos e-mails.',
  description: 'Nota interna para você e o time. Só o console vê.',
  logoUrl: 'URL pública HTTPS da logo. Vira o avatar da app no console. Se a imagem falhar, usamos as iniciais.',
  origins:
    'Lista de origins (protocolo + host + porta) autorizados no CORS. Sem o origin do seu frontend, o browser bloqueia as chamadas à API. Inclua localhost no dev e o domínio de produção.',
  jwt: 'Validade do access token do user. Curto (15 min) é o padrão seguro: a app renova com o refresh token sem pedir senha de novo.',
  refresh:
    'Quanto tempo o user permanece autenticado sem fazer login de novo. Ao expirar, precisa e-mail/senha ou Google outra vez.',
  google:
    'Client ID OAuth do Google Cloud (….apps.googleusercontent.com). O idToken do seu frontend precisa ser emitido para este Client ID. Vazio = Google Sign-In desligado nesta app.',
  requiredFields:
    'Campos que o cadastro de user precisa enviar. Sem um campo marcado, o create (e o google-token, exceto senha) responde 400.',
  fromName: 'Nome do remetente nos e-mails de verificação e reset. Ex.: o nome do seu produto.',
  fromEmail:
    'E-mail exibido como remetente nas mensagens. O SMTP real continua sendo o do MT ID; isto é só o que o user vê.',
  replyTo: 'Se o user responder o e-mail, a resposta cai neste endereço.',
  supportEmail: 'Contato de suporte citado nos e-mails transacionais.',
  supportUrl: 'Link de ajuda/suporte incluído nos e-mails.',
  loginUrl:
    'Link “entrar” nos e-mails. Precisa ser um origin (ou path nesse origin) que está em allowed origins. Vazio = páginas internas do MT ID.',
  verificationRedirect:
    'Para onde o user vai depois de clicar no link de verificar e-mail. Precisa bater com allowed origins. Vazio = página HTML do MT ID.',
  passwordResetRedirect:
    'Para onde o user vai depois de redefinir a senha. Precisa bater com allowed origins. Vazio = página HTML do MT ID.',
  appId: 'Identificador público da app. Vai no header appId no login de user e nas rotas da API.',
  apiKey: 'Identifica a aplicação nas rotas APPLICATION. Use no servidor junto com o apiSecret para pedir o token da app.',
  apiSecret:
    'Segredo da aplicação. Aparece só na criação ou na rotação. Nunca no frontend nem no Git. Quem tem o secret consegue um token APPLICATION.',
  rotateSecret: 'Invalida o apiSecret atual e gera outro. Todos os servidores que ainda usam o antigo param de autenticar.',
  appActive:
    'App inativa rejeita login de user e tokens da aplicação. Use para pausar um cliente sem apagar dados.',
  owners:
    'Owners desta aplicação no console. Writer e viewer são desta app, não do cadastro no MT ID. Adicione pelo e-mail. Remover tira o acesso a esta app, não desativa a conta.',
  ownerEmail: 'E-mail de um owner já existente. Ele entra só nesta app, no papel que você escolher.',
  roles:
    'Papéis da sua app (ADMIN, BILLING…). Entram no JWT do user em groups, junto com USER, e no claim roles. USER já é automático — não crie esse nome.',
  roleName: 'Nome em maiúsculas depois do save. Não use USER, APPLICATION, REFRESH_TOKEN, OWNER, OWNER_WRITER ou OWNER_VIEWER.',
  fields: {
    NAME: 'Nome do user. Exigido no create se estiver marcado.',
    USERNAME: 'Handle único nesta app (case-insensitive).',
    EMAIL: 'Obrigatório para login e-mail/senha. O user precisa verificar o e-mail antes de autenticar com senha.',
    PASSWORD: 'Login e-mail/senha. No Google Sign-In este campo é ignorado.',
    PHONE: 'Telefone em E.164. Útil se a sua app exige contato.',
    DOCUMENT: 'Documento (CPF, etc.) exigido no cadastro.',
    MARITAL_STATUS: 'Estado civil exigido no cadastro.',
  },
}
