#!/usr/bin/env node
/**
 * One-off: copy the archived comments (the old MySQL comment table, kept as
 * `comments` lists in post and project frontmatter) into the "comments"
 * Netlify Blobs store, so Blobs is the only place comments live.
 *
 *   node scripts/migrate-comments-to-blobs.mjs --dry     # print, write nothing
 *   node scripts/migrate-comments-to-blobs.mjs           # write
 *
 * The frontmatter lists were removed once this had run, so to run it again
 * read the files as they were at an earlier commit:
 *
 *   node scripts/migrate-comments-to-blobs.mjs --ref 21dcffb
 *
 * Safe to re-run: each archived comment gets the id "legacy-<old id>", and
 * ids already in the store are skipped. Live comments on the same page are
 * kept, and each page's list stays in date order.
 *
 * Site: .netlify/state.json (from `netlify link`) or NETLIFY_SITE_ID.
 * Token: NETLIFY_AUTH_TOKEN, or the Netlify CLI's saved login.
 */
import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import matter from "gray-matter"
import { commentStore, updateComments } from "../netlify/lib/comments.mjs"

const args = process.argv.slice(2)
const dry = args.includes("--dry")
const ref = args.includes("--ref") ? args[args.indexOf("--ref") + 1] : null

const COLLECTIONS = { blog: "blog", projects: "project" }

// Markdown files in a folder, from the working tree or from a commit.
const readFolder = dir => {
  if (!ref) {
    return readdirSync(dir)
      .filter(f => f.endsWith(".md"))
      .map(f => [f, readFileSync(join(dir, f), "utf8")])
  }
  return execFileSync("git", ["ls-tree", "--name-only", `${ref}:${dir}`], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(f => f.endsWith(".md"))
    .map(f => [
      f,
      execFileSync("git", ["show", `${ref}:${dir}/${f}`], { encoding: "utf8" }),
    ])
}

const isoDate = d => {
  if (!d) return new Date(0).toISOString()
  if (d instanceof Date) return d.toISOString()
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00Z` : d)
    .toISOString()
}

const archived = []
for (const [dir, route] of Object.entries(COLLECTIONS)) {
  for (const [file, text] of readFolder(`content/${dir}`)) {
    const path = `/${route}/${file.replace(/\.md$/, "")}`
    const list = matter(text).data.comments || []
    list.forEach((c, i) =>
      archived.push({
        id: `legacy-${c.id || `${path.slice(1).replace("/", "-")}-${i}`}`,
        path,
        author: String(c.author || "").trim() || "Anonymous",
        body: String(c.body || "").trim(),
        date: isoDate(c.date),
      })
    )
  }
}

const byPath = archived.reduce((acc, c) => {
  ;(acc[c.path] = acc[c.path] || []).push(c)
  return acc
}, {})

console.log(
  `${archived.length} archived comments on ${Object.keys(byPath).length} pages` +
    (ref ? ` (as of ${ref})` : "")
)
for (const [path, list] of Object.entries(byPath)) {
  console.log(`  ${path}  ${list.length}`)
}
if (dry || archived.length === 0) process.exit(0)

const siteID =
  process.env.NETLIFY_SITE_ID ||
  (existsSync(".netlify/state.json") &&
    JSON.parse(readFileSync(".netlify/state.json", "utf8")).siteId)

const cliToken = () => {
  const configs = [
    join(homedir(), "Library/Preferences/netlify/config.json"),
    join(homedir(), ".config/netlify/config.json"),
  ]
  for (const file of configs.filter(existsSync)) {
    const config = JSON.parse(readFileSync(file, "utf8"))
    const token = config.users?.[config.userId]?.auth?.token
    if (token) return token
  }
  return null
}
const token = process.env.NETLIFY_AUTH_TOKEN || cliToken()

if (!siteID || !token) {
  console.error(
    "Need a site and a token: run `netlify link` and `netlify login`, or set " +
      "NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN."
  )
  process.exit(1)
}

const store = commentStore({ siteID, token })
let added = 0
for (const [path, list] of Object.entries(byPath)) {
  let fresh = []
  await updateComments(
    path,
    current => {
      const have = new Set(current.map(c => c.id))
      fresh = list.filter(c => !have.has(c.id))
      if (fresh.length === 0) return current
      return [...current, ...fresh].sort((a, b) =>
        a.date < b.date ? -1 : a.date > b.date ? 1 : 0
      )
    },
    store
  )
  added += fresh.length
}
console.log(`Added ${added}; ${archived.length - added} were already there.`)
