import * as React from "react"

/**
 * Comments on a post or project, and the form to add one.
 *
 * Every comment lives in Netlify Blobs, including the ones carried over from
 * the old MySQL table. New ones are posted through the "comment" Netlify
 * Form, checked and saved by netlify/functions/submission-created.mjs, and
 * the list is fetched from /api/comments after the page loads, so none of
 * it is in the static HTML. See README > "Comments".
 *
 * The form has to stay in the server-rendered HTML: Netlify finds forms by
 * parsing the built pages, and only keeps fields it saw there.
 */
const TONES = ["sky", "mint", "sun", "pink"]

// Same limits as netlify/lib/comments.mjs. Checked here too so a real person
// gets told, rather than having their comment dropped quietly.
const MAX_NAME = 60
const MAX_MESSAGE = 2000
const MAX_LINKS = 2
const LINK = /https?:\/\/|www\.|\[url/gi

// Mirrors the server's clean-up, so a comment shown as "just now" can be
// matched against the saved copy once it comes back.
const clean = s =>
  String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

const cleanName = s => clean(s).replace(/\s+/g, " ") || "Anonymous"

const formatDate = iso =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

// submission-created runs a few seconds after the form is sent, so look
// again a few times until the new comment turns up.
const REFETCH_AFTER = [3000, 8000, 20000]

const Comment = ({ c, tone }) => (
  <li className={`comment${c.justNow ? " is-new" : ""}`}>
    <div className={`bubble tone-${tone}`}>
      {String(c.body || "")
        .split(/\n{2,}/)
        .map((para, j) => (
          <p key={j}>{para}</p>
        ))}
    </div>
    <p className="comment-by">
      <strong>{c.author || "Anonymous"}</strong>
      {c.justNow ? (
        <> · just now</>
      ) : (
        c.date && (
          <>
            {" · "}
            <time dateTime={c.iso || c.date}>{c.date}</time>
          </>
        )
      )}
    </p>
  </li>
)

/**
 * A page's comments, fetched once the page has loaded. `comments` is null
 * until the first response, so callers can tell "none" from "not yet".
 * The template calls this so the hero can show the count as well.
 */
export const useComments = path => {
  const [comments, setComments] = React.useState(null)

  const reload = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?path=${encodeURIComponent(path)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setComments(
        data.comments.map(c => ({ ...c, iso: c.date, date: formatDate(c.date) }))
      )
    } catch (e) {
      // No function to call (gatsby develop), or offline. The form still
      // works; show an empty list rather than "loading" forever.
      setComments(c => c || [])
    }
  }, [path])

  React.useEffect(() => {
    reload()
  }, [reload])

  return { comments, reload }
}

/** Comment count per page path, for lists of posts. Empty until loaded. */
export const useCommentCounts = () => {
  const [counts, setCounts] = React.useState({})
  React.useEffect(() => {
    fetch("/api/comments?counts=1")
      .then(res => (res.ok ? res.json() : { counts: {} }))
      .then(data => setCounts(data.counts || {}))
      .catch(() => {})
  }, [])
  return counts
}

const Comments = ({ path, comments, reload }) => {
  const live = comments || []
  const [sent, setSent] = React.useState([])
  const [status, setStatus] = React.useState({ state: "idle" })
  const shownAt = React.useRef(0)
  const timers = React.useRef([])

  React.useEffect(() => {
    shownAt.current = Date.now()
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  // Comments sent from this tab that haven't come back from the server yet.
  const waiting = sent.filter(
    s => !live.some(l => l.author === s.author && l.body === s.body)
  )
  const all = [...live, ...waiting]

  const onSubmit = async e => {
    e.preventDefault()
    const form = e.currentTarget
    const fields = new FormData(form)
    const name = String(fields.get("name") || "")
    const message = clean(fields.get("message"))

    let problem = null
    if (message.length < 2) problem = "Write a message first."
    else if (message.length > MAX_MESSAGE)
      problem = `That's over ${MAX_MESSAGE} characters. Try trimming it.`
    else if ((message.match(LINK) || []).length > MAX_LINKS)
      problem = `At most ${MAX_LINKS} links, please.`
    else if (name.trim().length > MAX_NAME) problem = "That name's too long."
    if (problem) {
      setStatus({ state: "error", text: problem })
      return
    }

    fields.set("elapsed", String(Date.now() - shownAt.current))
    setStatus({ state: "sending" })

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(fields).toString(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      setStatus({
        state: "error",
        text: "That didn't send. Give it a moment and try again.",
      })
      return
    }

    setSent(s => [
      ...s,
      {
        id: `sent-${Date.now()}`,
        author: cleanName(name),
        body: message,
        justNow: true,
      },
    ])
    form.elements.message.value = ""
    setStatus({ state: "sent", text: "Thanks! Your comment is up." })
    timers.current.push(...REFETCH_AFTER.map(ms => setTimeout(reload, ms)))
  }

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="section-title">
        Comments{" "}
        {all.length > 0 && <span className="comment-count">{all.length}</span>}
      </h2>

      {comments === null && <p className="muted">Loading comments…</p>}

      {all.length > 0 && (
        <ol className="comment-list">
          {all.map((c, i) => (
            <Comment key={c.id || i} c={c} tone={TONES[i % TONES.length]} />
          ))}
        </ol>
      )}

      <form
        name="comment"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        className="card comment-form"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="form-name" value="comment" />
        <input type="hidden" name="page" value={path} />
        <input type="hidden" name="elapsed" value="" />
        <p className="hp">
          <label>
            Leave this empty{" "}
            <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <h3 className="form-title">
          {comments !== null && all.length === 0
            ? "Be the first to comment"
            : "Add a comment"}
        </h3>

        <div className="field-row">
          <label className="field" htmlFor="comment-name">
            <span>Name</span>
            <input
              id="comment-name"
              name="name"
              type="text"
              maxLength={MAX_NAME}
              autoComplete="name"
              placeholder="Anonymous"
            />
          </label>
          <label className="field" htmlFor="comment-email">
            <span>Email (optional, never shown)</span>
            <input
              id="comment-email"
              name="email"
              type="email"
              autoComplete="email"
            />
          </label>
        </div>

        <label className="field" htmlFor="comment-message">
          <span>Message</span>
          <textarea
            id="comment-message"
            name="message"
            required
            maxLength={MAX_MESSAGE}
          />
        </label>

        <div className="comment-form-foot">
          <button
            type="submit"
            className="btn tone-sun"
            disabled={status.state === "sending"}
          >
            {status.state === "sending" ? "Sending…" : "Send"}
          </button>
          <p
            className={`form-status is-${status.state}`}
            role="status"
            aria-live="polite"
          >
            {status.text}
          </p>
        </div>
      </form>
    </section>
  )
}

export default Comments
