const URL_PATTERN = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi

export function splitLinks(text) {
  if (!text) return []
  const parts = []
  let lastIndex = 0
  const matches = String(text).matchAll(URL_PATTERN)

  for (const match of matches) {
    const value = match[0]
    const index = match.index ?? 0
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) })
    }
    parts.push({ type: 'link', value })
    lastIndex = index + value.length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts
}

export function hrefForUrl(url) {
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

export function hasLink(text) {
  if (!text) return false
  URL_PATTERN.lastIndex = 0
  return URL_PATTERN.test(String(text))
}
