import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLenis } from 'lenis/react'

const HEADER_OFFSET = -96

function scrollPage(lenis, target) {
  if (lenis) {
    lenis.scrollTo(target, {
      offset: target === 0 ? 0 : HEADER_OFFSET,
      duration: 0.9,
      force: true,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    })
    return
  }
  if (target === 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function ScrollRestore() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()

  useLayoutEffect(() => {
    const target = hash || 0
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => scrollPage(lenis, target))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [pathname, hash, lenis])

  return null
}
