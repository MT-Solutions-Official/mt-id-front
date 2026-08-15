import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AppWindow,
  ArrowUpRight,
  Fingerprint,
  Globe,
  Hash,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Timer,
} from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { CodeBlock } from '../components/ui/CodeBlock'
import { SiteFooter, SiteHeader } from '../components/layout/SiteChrome'
import { cn } from '../lib/cn'
import { useAuth } from '../lib/auth'
import { API_URL } from '../lib/env'

const ease = [0.22, 1, 0.36, 1]

function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

const samples = [
  {
    id: 'user',
    label: 'User',
    hint: 'Header appId obrigatório · e-mail verificado · access 15 min',
    code: `POST /api/v1/auth/users/token
appId: 64f1c2a9e8b17d001234abcd

{
  "email": "jane@acme.io",
  "password": "••••••••"
}`,
  },
  {
    id: 'app',
    label: 'Application',
    hint: 'apiKey + apiSecret · grupo APPLICATION · appId sai do JWT',
    code: `POST /api/v1/auth/application/token

{
  "apiKey": "mtid_live_…",
  "apiSecret": "••••••••"
}`,
  },
  {
    id: 'google',
    label: 'Google',
    hint: 'JWKS local · provision de user · audience da app',
    code: `POST /api/v1/auth/users/google-token
appId: 64f1c2a9e8b17d001234abcd

{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6…"
}`,
  },
]

const actors = [
  {
    n: '01',
    title: 'Owner',
    group: 'OWNER',
    text: 'Conta do MT ID. Participa de várias apps: writer numa, viewer noutra. O token do owner não autentica users.',
    icon: Fingerprint,
  },
  {
    n: '02',
    title: 'Application',
    group: 'APPLICATION',
    text: 'O backend da sua app troca apiKey/apiSecret por JWT. Cria users, gira secret, não entra no browser.',
    icon: KeyRound,
  },
  {
    n: '03',
    title: 'User',
    group: 'USER',
    text: 'O front autentica com o header appId. O token de uma app não lê a outra.',
    icon: ShieldCheck,
  },
]

const steps = [
  {
    n: '01',
    title: 'Crie a aplicação',
    text: 'No console: origins, campos obrigatórios, branding de e-mail e audience Google.',
  },
  {
    n: '02',
    title: 'Emita o token da app',
    text: 'O servidor troca apiKey e apiSecret por um JWT APPLICATION. Users nunca veem o secret.',
  },
  {
    n: '03',
    title: 'Autentique o user',
    text: 'Senha ou Google, com appId no header. Access de 15 min, refresh rotacionado.',
  },
]

const features = [
  { title: 'Multi-app', text: 'Users, papéis, origins e Google isolados por appId.', icon: AppWindow },
  { title: 'JWT curto', text: 'Access de 15 min, refresh rotacionado, jti hasheado.', icon: Timer },
  { title: 'Caminho crítico', text: 'Bcrypt, HIBP, throttle. Tokens de e-mail só em hash.', icon: Lock },
  { title: 'Google JWKS', text: 'Validação local do ID token. Provision respeita requiredUserFields.', icon: Globe },
  { title: 'E-mail da app', text: 'Verificação e reset com branding. Sem redirect, o MT ID serve as páginas.', icon: Mail },
  { title: 'Console', text: 'Rotaciona secret, define campos e origins — sem Postman.', icon: KeyRound },
]

const guarantees = [
  { title: 'HIBP', text: 'Senha vazada não entra.', icon: ShieldCheck },
  { title: 'Throttle', text: 'Por e-mail e por IP.', icon: Timer },
  { title: 'Hash', text: 'Reset, verify e jti nunca em claro.', icon: Hash },
  { title: 'Corte', text: 'Disable derruba a sessão.', icon: Lock },
]

const claims = [
  ['iss', API_URL],
  ['sub', '64f1c2a9e8b17d001234abcd'],
  ['groups', 'USER'],
  ['appId', 'acme-prod'],
  ['exp', '900s'],
  ['jti', 'sha256(…)'],
]

function TokenCard() {
  return (
    <div className="panel relative overflow-hidden rounded-3xl">
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-accent-2/20 blur-3xl" />
      <div className="relative border-b border-line px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase">Access token</p>
            <p className="mt-1 text-sm font-medium">JWT · RS256</p>
          </div>
          <Badge tone="ok">live</Badge>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/6">
          <div className="landing-ttl h-full rounded-full bg-gradient-to-r from-accent via-accent-2 to-accent-3" />
        </div>
        <p className="mt-2 font-mono text-[10px] text-ink-faint">TTL 15 min · refresh rotacionado</p>
      </div>
      <dl className="relative divide-y divide-line">
        {claims.map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 + index * 0.06, duration: 0.4, ease }}
            className="flex items-baseline justify-between gap-4 px-5 py-3"
          >
            <dt className="font-mono text-[11px] tracking-wide text-accent">{key}</dt>
            <dd className="truncate font-mono text-[12px] text-ink-muted">{value}</dd>
          </motion.div>
        ))}
      </dl>
    </div>
  )
}

export function Landing() {
  const { hasSession } = useAuth()
  const [sample, setSample] = useState(samples[0])

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="pointer-events-none absolute inset-0 tech-grid" />
      <div className="relative z-10">
        <SiteHeader />

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-16 md:pt-24 md:pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase"
            >
              Identity provider
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease }}
              className="display mt-5 text-[52px] md:text-[84px]"
            >
              Identidade
              <br />
              para as suas apps.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease }}
              className="mt-7 max-w-lg text-[17px] leading-8 text-ink-muted"
            >
              Owners administram. Applications emitem JWT. Users autenticam com o header{' '}
              <span className="font-mono text-ink">appId</span>. Senha, Google e verificação de e-mail já estão no IdP.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link to={hasSession ? '/app' : '/signup'}>
                <Button size="lg">
                  {hasSession ? 'Abrir o console' : 'Começar no console'}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="secondary">
                  Contratos
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-8 flex flex-wrap gap-2"
            >
              <Badge>JWT 15 min</Badge>
              <Badge>HIBP</Badge>
              <Badge>Google JWKS</Badge>
              <Badge>appId isolado</Badge>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease }}
            className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
          >
            <TokenCard />
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Modelo</p>
                <h2 className="display mt-3 text-4xl md:text-5xl">Três atores. Um IdP.</h2>
              </div>
              <Link to="/docs/architecture" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
                Arquitetura
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {actors.map((actor, index) => (
              <Reveal key={actor.title} delay={index * 0.08} className="h-full">
                <article className="panel h-full rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-ink-faint">{actor.n}</span>
                    <actor.icon className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight">{actor.title}</h3>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">{actor.group}</p>
                  <p className="mt-4 text-sm leading-7 text-ink-muted">{actor.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
          <Reveal>
            <div className="panel overflow-hidden rounded-3xl">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-line p-6 lg:border-r lg:border-b-0 lg:p-8">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Protocolo</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">O contrato HTTP</h2>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    User leva <span className="font-mono text-ink">appId</span> no header. Application troca credenciais no
                    body. Google valida o ID token localmente — sem round-trip extra.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-line p-1">
                    {samples.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSample(item)}
                        className={cn(
                          'flex-1 rounded-lg px-3 py-2 text-sm',
                          sample.id === item.id ? 'bg-white/8 text-ink' : 'text-ink-muted hover:text-ink',
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 font-mono text-[11px] leading-5 text-ink-faint">{sample.hint}</p>
                </div>
                <div className="p-4 lg:p-5">
                  <CodeBlock code={sample.code} language="http" />
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="border-y border-line bg-bg-muted/50">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Fluxo</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">Do console ao user</h2>
            </Reveal>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line md:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal key={step.n} delay={index * 0.08} className="bg-bg px-6 py-8">
                  <span className="font-mono text-[11px] text-accent">{step.n}</span>
                  <h3 className="mt-4 text-[17px] font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-muted">{step.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Capacidades</p>
                <h2 className="display mt-3 text-4xl md:text-5xl">O que está no IdP</h2>
              </div>
              <Link to="/docs" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
                Documentação
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.05} className="h-full">
                <article className="h-full rounded-2xl border border-line bg-bg-muted/40 px-6 py-7">
                  <feature.icon className="h-4 w-4 text-accent" />
                  <h3 className="mt-4 text-[15px] font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-muted">{feature.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
          <Reveal>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line sm:grid-cols-2 lg:grid-cols-4">
              {guarantees.map((item) => (
                <div key={item.title} className="bg-bg-muted/80 px-5 py-6">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 text-accent" />
                    <span className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">{item.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
          <Reveal>
            <div className="panel relative overflow-hidden rounded-3xl px-6 py-12 md:px-12 md:py-16">
              <div className="pointer-events-none absolute inset-0 aurora opacity-70" />
              <div className="relative">
                <h2 className="display max-w-[10ch] text-5xl md:text-7xl">Plugue a sua app.</h2>
                <p className="mt-6 max-w-lg text-[16px] leading-7 text-ink-muted">
                  Quickstart, CORS, Google e o formato de erro estão na documentação. O console é só para o owner.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/docs/quickstart">
                    <Button size="lg">
                      Quickstart
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to={hasSession ? '/app' : '/login'}>
                    <Button size="lg" variant="secondary">
                      {hasSession ? 'Console' : 'Entrar'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <SiteFooter />
      </div>
    </div>
  )
}
