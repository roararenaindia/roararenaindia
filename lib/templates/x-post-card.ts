function escapeXml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapText(text: string, max = 34) {
  const words = text.replace(/https?:\/\/\S+/g, '').split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > max && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
    if (lines.length >= 5) break
  }

  if (current && lines.length < 5) lines.push(current)
  return lines.length ? lines : ['Roar Arena update']
}

export function createXTextCardDataUri(text: string) {
  const lines = wrapText(text)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#050505"/>
      <stop offset="0.55" stop-color="#111216"/>
      <stop offset="1" stop-color="#020202"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ff4b1f" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#ff4b1f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="160" cy="180" r="330" fill="url(#glow)"/>
  <circle cx="980" cy="870" r="360" fill="url(#glow)" opacity="0.85"/>
  <text x="90" y="125" fill="#ffffff" font-family="Arial Black, Impact, sans-serif" font-size="42" font-weight="900" letter-spacing="8">ROAR</text>
  <text x="90" y="175" fill="#ff4b1f" font-family="Arial Black, Impact, sans-serif" font-size="34" font-weight="900" letter-spacing="10">ARENA</text>
  <rect x="90" y="225" width="900" height="2" fill="#ff4b1f" opacity="0.7"/>
  <text x="90" y="315" fill="#ff4b1f" font-family="Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="5">FROM X</text>
  ${lines.map((line, index) => `<text x="90" y="${420 + index * 78}" fill="#ffffff" font-family="Arial Black, Impact, sans-serif" font-size="58" font-weight="900">${escapeXml(line.toUpperCase())}</text>`).join('')}
  <rect x="90" y="880" width="900" height="100" rx="30" fill="#ffffff" opacity="0.06" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="540" y="942" text-anchor="middle" fill="#ff4b1f" font-family="Arial Black, Impact, sans-serif" font-size="30" font-weight="900" letter-spacing="4">WHERE FANS COME ALIVE</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
