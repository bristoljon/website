import {
  commentStore,
  isAdmin,
  json,
  makeComment,
  normalisePath,
  readComments,
  updateComments,
} from "../lib/comments.mjs"
import { problemWith } from "../../src/utils/comment-rules.mjs"

/**
 * GET    /api/comments?path=/blog/update-3   a page's live comments, oldest first
 * GET    /api/comments?counts=1              {path: count} for every page
 * GET    /api/comments?recent=1              newest across the site (admin)
 * POST   /api/comments  {path, name, message} the owner's comment (admin)
 * DELETE /api/comments  {path, id}           remove one (admin)
 *
 * Admin calls carry "Authorization: Bearer <COMMENTS_ADMIN_KEY>". Everyone
 * else comments through the Netlify Form. The owner posts here instead, so
 * the key never lands in the form's submission log or notification emails,
 * and so the comment can carry the "author" badge and a reserved name.
 */

const RECENT = 100

const publicFields = ({ id, author, body, date, owner }) => ({
  id,
  author,
  body,
  date,
  ...(owner ? { owner: true } : {}),
})

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

// Every page's list. Fine at this site's size: a handful of pages.
const allLists = async () => {
  const store = commentStore()
  const { blobs } = await store.list()
  return Promise.all(
    blobs.map(async b => ({
      path: `/${b.key}`,
      comments: (await store.get(b.key, { type: "json" })) || [],
    }))
  )
}

const recent = async () =>
  (await allLists())
    .flatMap(l => l.comments)
    .sort(byDate)
    .reverse()
    .slice(0, RECENT)

const counts = async () =>
  Object.fromEntries(
    (await allLists())
      .filter(l => l.comments.length > 0)
      .map(l => [l.path, l.comments.length])
  )

export default async req => {
  const url = new URL(req.url)

  if (req.method === "GET") {
    if (url.searchParams.has("counts")) {
      return json({ counts: await counts() })
    }

    if (url.searchParams.has("recent")) {
      if (!isAdmin(req)) return json({ error: "unauthorised" }, { status: 401 })
      return json({ comments: await recent() })
    }

    const path = normalisePath(url.searchParams.get("path"))
    if (!path) return json({ error: "bad path" }, { status: 400 })
    const comments = (await readComments(path)).sort(byDate).map(publicFields)
    return json({ comments })
  }

  if (req.method === "POST") {
    if (!isAdmin(req)) return json({ error: "unauthorised" }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const path = normalisePath(body.path)
    if (!path) return json({ error: "bad path" }, { status: 400 })
    const problem = problemWith(body, { owner: true })
    if (problem) return json({ error: problem }, { status: 400 })

    const comment = makeComment(path, body, { owner: true })
    await updateComments(path, list => [...list, comment])
    return json({ comment: publicFields(comment) }, { status: 201 })
  }

  if (req.method === "DELETE") {
    if (!isAdmin(req)) return json({ error: "unauthorised" }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const path = normalisePath(body.path)
    if (!path || !body.id) return json({ error: "bad request" }, { status: 400 })

    let removed = false
    await updateComments(path, list => {
      const next = list.filter(c => c.id !== body.id)
      removed = next.length !== list.length
      return removed ? next : list
    })
    return json({ removed }, { status: removed ? 200 : 404 })
  }

  return json(
    { error: "method not allowed" },
    { status: 405, headers: { allow: "GET, POST, DELETE" } }
  )
}

export const config = { path: "/api/comments" }
