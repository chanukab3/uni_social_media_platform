export default function MessageText({ text }){
  if(!text) return null

  const parts = []
  const urlPattern = /https?:\/\/[^\s]+/g
  let lastIndex = 0
  let match

  while((match = urlPattern.exec(text))){
    const punctuation = match[0].match(/[.,!;:)\]]+$/)?.[0] || ''
    const url = match[0].slice(0, match[0].length - punctuation.length)
    if(!url) continue
    parts.push(text.slice(lastIndex, match.index))
    parts.push(<a key={match.index} href={url}>{url}</a>, punctuation)
    lastIndex = match.index + match[0].length
  }

  parts.push(text.slice(lastIndex))
  return parts
}
