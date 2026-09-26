import { getStore } from "@netlify/blobs"
import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto"
import {
  cleanName,
  clean,
  LIMITS,
  OWNER_NAME,
  problemWith,
} from "../../src/utils/comment-rules.mjs"

export { LIMITS }

/**
 * Shared by the two comment functions. Live comments sit in the "comments"
 * Blobs store, one JSON list per page, keyed on the page path without its
 * leading slash ("blog/update-3"), because Blobs keys can't start with "/".
 * That includes the archive from the old MySQL comment table.
 *
 * Strong consistency, so a comment written by submission-created shows up on
 * the next read rather than up to a minute later. Inside a function the site
 * and token come from the environment; scripts pass { siteID, token }.
 */
export const commentStore = (options = {}) =>
  getStore({ name: "comments", consistency: "strong", ...options })

export const rateStore = () =>
  getStore({ name: "comment-rate", consistency: "strong" })

// Only real post and project pages can hold comments. Anything else in the
// "page" field is someone posting to the form by hand.
const PAGE = /^\/(blog|project)\/[a-z0-9][a-z0-9-]{0,80}$/

export const normalisePath = raw => {
  const path = String(raw || "").trim().replace(/\/+$/, "")
  return PAGE.test(path) ? path : null
}

/**
 * A stored comment. Only the owner's carry `owner`, which shows as the
 * "author" badge; those come in through the admin-keyed POST, never the form.
 */
export const makeComment = (path, { name, message }, { owner = false } = {}) => ({
  id: randomUUID(),
  path,
  author: cleanName(name) || (owner ? OWNER_NAME : "Anonymous"),
  body: clean(message),
  date: new Date().toISOString(),
  ...(owner ? { owner: true } : {}),
})

/**
 * The checks submission-created runs on top of Netlify's spam filter.
 * Returns [comment, null] or [null, reason].
 */
export const check = data => {
  if (data["bot-field"]) return [null, "honeypot"]

  const path = normalisePath(data.page)
  if (!path) return [null, "bad page"]

  // "elapsed" is filled in by the browser at submit time: how long the form
  // had been on screen. Measured on the client alone, so a wrong clock on the
  // visitor's machine doesn't matter. No JavaScript means no value.
  const elapsed = Number(data.elapsed)
  if (!Number.isFinite(elapsed) || elapsed < LIMITS.minElapsed)
    return [null, "too fast"]
  if (elapsed > LIMITS.maxElapsed) return [null, "too slow"]

  const problem = problemWith(data)
  if (problem) return [null, problem]

  return [makeComment(path, data), null]
}

export const keyFor = path => path.slice(1)

/**
 * Read-modify-write on one page's list. Two comments landing on the same page
 * at once would otherwise overwrite each other, so the write is conditional on
 * the ETag we read and retried if someone else got there first.
 */
export const updateComments = async (path, change, store = commentStore()) => {
  const key = keyFor(path)

  for (let attempt = 0; attempt < 5; attempt++) {
    const entry = await store.getWithMetadata(key, { type: "json" })
    const current = Array.isArray(entry?.data) ? entry.data : []
    const next = change(current)
    if (next === current) return current

    const { modified } = entry
      ? await store.setJSON(key, next, { onlyIfMatch: entry.etag })
      : await store.setJSON(key, next, { onlyIfNew: true })
    if (modified) return next
  }
  throw new Error(`Couldn't update comments for ${path}`)
}

export const readComments = async path =>
  (await commentStore().get(keyFor(path), { type: "json" })) || []

/**
 * The raw address is never stored. It's hashed with a secret so the hashes
 * in the rate-limit store can't be reversed by hashing all of IPv4.
 */
export const hashIp = ip => {
  const secret = process.env.COMMENTS_ADMIN_KEY
  return secret
    ? createHmac("sha256", secret).update(String(ip)).digest("hex")
    : createHash("sha256").update(`bristoljon:${ip}`).digest("hex")
}

/** Bearer-token check for the moderation page. Closed when no key is set. */
export const isAdmin = req => {
  const expected = process.env.COMMENTS_ADMIN_KEY
  if (!expected) return false
  const given = (req.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    ""
  )
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  })
