import * as React from "react"

const UNITS = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
]

/** "today", "yesterday", "3 days ago", "10 years ago"… */
export const relative = (iso, now = new Date()) => {
  const seconds = (now - new Date(iso)) / 1000
  if (seconds < 24 * 3600) return "today"
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" })
  for (const [unit, size] of UNITS) {
    const n = Math.floor(seconds / size)
    if (n >= 1) return rtf.format(-n, unit)
  }
  return "today"
}

/**
 * A date shown as relative time ("2 years ago"). The site is static, so the
 * build can't know when it's being read: the server-rendered HTML carries the
 * absolute date, and the relative one is filled in once the page loads.
 * Hovering shows the full date either way.
 */
const RelativeTime = ({ iso, date, className }) => {
  const [text, setText] = React.useState(date)
  React.useEffect(() => setText(relative(iso)), [iso])
  return (
    <time className={className} dateTime={iso} title={date}>
      {text}
    </time>
  )
}

export default RelativeTime
