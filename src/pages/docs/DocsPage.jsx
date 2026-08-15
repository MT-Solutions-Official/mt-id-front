import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { docs, docsFlat } from '../../content/docs'
import { DocArticle } from './DocArticle'

export function DocsPage() {
  const { slug } = useParams()
  const key = slug || 'overview'
  const page = docs[key]
  const index = docsFlat.findIndex((item) => item.slug === key)
  const prev = index > 0 ? docsFlat[index - 1] : null
  const next = index >= 0 && index < docsFlat.length - 1 ? docsFlat[index + 1] : null

  if (!page) {
    return <p className="text-ink-muted">Página não encontrada.</p>
  }
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <DocArticle page={page} path={slug ? `/docs/${slug}` : '/docs'} prev={prev} next={next} />
    </motion.div>
  )
}
