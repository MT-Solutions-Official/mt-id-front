import { docs, docsFlat } from '../content/docs'

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, ' ')
    .trim()
}

function mdTable(headers, rows) {
  const head = `| ${headers.map(escapeCell).join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`).join('\n')
  return `${head}\n${sep}\n${body}`
}

function fence(language, code) {
  const lang = language || ''
  return `\`\`\`${lang}\n${String(code ?? '').trimEnd()}\n\`\`\``
}

function sectionToMarkdown(section) {
  const blocks = [`## ${section.title}`]

  if (section.endpoint) {
    const auth = section.endpoint.auth ? ` · auth: ${section.endpoint.auth}` : ''
    blocks.push(`\`${section.endpoint.method} ${section.endpoint.path}\`${auth}`)
  }

  if (section.paragraphs?.length) {
    blocks.push(section.paragraphs.join('\n\n'))
  }

  if (section.callout) {
    const title = section.callout.title ? `**${section.callout.title}.** ` : ''
    blocks.push(`> ${title}${section.callout.body}`)
  }

  if (section.bullets?.length) {
    blocks.push(section.bullets.map((item) => `- ${item}`).join('\n'))
  }

  if (section.steps?.length) {
    blocks.push(section.steps.map((item, index) => `${index + 1}. ${item}`).join('\n'))
  }

  if (section.fields?.length) {
    blocks.push(
      mdTable(
        ['Campo', 'Obrigatório', 'Detalhe'],
        section.fields.map((field) => [field.name, field.required ? 'Sim' : 'Não', field.notes || '']),
      ),
    )
  }

  if (section.table) {
    blocks.push(mdTable(section.table.headers, section.table.rows))
  }

  if (section.code) {
    blocks.push(fence(section.code.language, section.code.code))
  }

  if (section.codeTabs?.length) {
    for (const tab of section.codeTabs) {
      blocks.push(`**${tab.label}**\n\n${fence(tab.language, tab.code)}`)
    }
  }

  return blocks.join('\n\n')
}

export function pageToMarkdown(page, { path } = {}) {
  if (!page) return ''

  const parts = [
    `# ${page.title}`,
    page.kicker ? `_${page.kicker}_` : null,
    path ? `Página: ${path}` : null,
    page.lead,
    ...(page.sections || []).map(sectionToMarkdown),
  ].filter(Boolean)

  return `${parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()}\n`
}

const FULL_PREAMBLE = `# MT ID — documentação da API

Contrato do identity provider MT ID. Use isto como fonte da verdade para integrar.

- Base URL (dev): http://localhost:8081
- Swagger: http://localhost:8081/swagger-ui
- OpenAPI: http://localhost:8081/q/openapi

Writer/viewer de owner é por aplicação (\`client-application.owners[].role\`). O JWT do owner é só \`OWNER\`.
`

export function allDocsToMarkdown() {
  const pages = docsFlat
    .map((item) => pageToMarkdown(docs[item.slug], { path: item.to }))
    .filter(Boolean)
    .join('\n\n---\n\n')
  return `${FULL_PREAMBLE}\n---\n\n${pages}`
}
