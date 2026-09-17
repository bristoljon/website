#!/usr/bin/env node
/**
 * Import the legacy PHP/MySQL content straight from a phpMyAdmin dump file.
 *
 * Same job as migrate-mysql.js, minus the database: that script needs a live
 * server to connect to, this one reads the .sql text. Use it when all you have
 * left is the export.
 *
 *   node scripts/import-sql-dump.js [dump.sql] [--dry]
 *
 * What comes out of the dump that nothing else can recover: the real publish
 * dates, the tag joins, and the comments (they were loaded over AJAX, so they
 * never appear in the rendered HTML the scraper sees).
 *
 * Existing files are merged, not replaced. Hand-written frontmatter is kept —
 * see PRESERVE — and so is any blog body already converted to markdown, since
 * those read better than a machine pass over the stored HTML. Everything else
 * (date, tags, comments, project bodies) comes from the dump.
 */

const fs = require("fs")
const path = require("path")
const TurndownService = require("turndown")

const args = process.argv.slice(2)
const DRY = args.includes("--dry")
const DUMP = path.resolve(
  args.find(a => !a.startsWith("--")) ||
    path.join(__dirname, "..", "localhost.sql")
)

const CONTENT = path.join(__dirname, "..", "content")
const OUT = {
  blog: path.join(CONTENT, "blog"),
  projects: path.join(CONTENT, "projects"),
}

// Frontmatter written by hand beats anything derivable from the dump, so these
// keys are carried across from the existing file untouched when it has them.
const PRESERVE = ["excerpt", "status", "image", "imageCredit"]

// Junk rows. Two scratch records and a second draft of the iMedic page that
// duplicates project 1 — the live site only ever linked /project/imedic.
const SKIP_PROJECT_IDS = new Set([19, 20, 17])

// ---------------------------------------------------------------------------
// Dump parsing
// ---------------------------------------------------------------------------

const ESCAPES = { n: "\n", r: "\r", t: "\t", b: "\b", 0: "\0", Z: "\x1a" }

/**
 * Reads the tuple list of an INSERT, starting just past VALUES, and stops at
 * the statement's semicolon. Done by hand rather than by regex because the
 * content columns are full of quotes, semicolons and escaped newlines, and a
 * lazy `[\s\S]*?;` match splits a row straight down the middle.
 */
function readTuples(sql, i) {
  const rows = []
  let row = null
  let cur = ""
  let quoted = false
  let inString = false

  while (i < sql.length) {
    const c = sql[i]

    if (inString) {
      if (c === "\\") {
        const next = sql[i + 1]
        cur += next in ESCAPES ? ESCAPES[next] : next
        i += 2
        continue
      }
      // '' is the other way MySQL escapes a quote inside a string.
      if (c === "'" && sql[i + 1] === "'") {
        cur += "'"
        i += 2
        continue
      }
      if (c === "'") {
        inString = false
        i++
        continue
      }
      cur += c
      i++
      continue
    }

    if (row === null) {
      if (c === "(") {
        row = []
        cur = ""
        quoted = false
        i++
        continue
      }
      if (c === ";") {
        i++
        break
      }
      i++
      continue
    }

    if (c === "'") {
      inString = true
      quoted = true
      cur = "" // drop the separator whitespace sitting between `,` and the quote
      i++
      continue
    }
    if (c === ",") {
      row.push(literal(cur, quoted))
      cur = ""
      quoted = false
      i++
      continue
    }
    if (c === ")") {
      row.push(literal(cur, quoted))
      rows.push(row)
      row = null
      i++
      continue
    }
    cur += c
    i++
  }

  return { rows, end: i }
}

function literal(raw, quoted) {
  if (quoted) return fixEncoding(raw)
  const t = raw.trim()
  if (t === "" || t.toUpperCase() === "NULL") return null
  const n = Number(t)
  return Number.isNaN(n) ? t : n
}

/**
 * The columns are latin1 but the site wrote UTF-8 into them, so the dump comes
 * back doubly encoded: "£59" was stored as the two bytes C2 A3 read back as two
 * separate characters, and dumped as "Â£59". Squeezing the string down to bytes
 * again and decoding it as UTF-8 undoes that.
 *
 * The re-reading was cp1252, not latin1, which matters for the 0x80-0x9F range:
 * an emoji like 🙌 (F0 9F 99 8C) came back as "ðŸ™Œ", where ™ is byte 0x99 and
 * Œ is 0x8C. Going by code point alone loses those and strands the emoji.
 */
const CP1252 = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
}

const utf8 = new TextDecoder("utf-8", { fatal: true })

/**
 * Only applied when the whole value survives the round trip. Text that is
 * already correct fails the strict decode — a lone curly quote is a UTF-8
 * continuation byte with no lead byte — and so is arbitrary binary like the
 * sample ciphertext on the one-time-pad page. Both are left exactly as found.
 */
function fixEncoding(s) {
  if (!/[-￿]/.test(s)) return s

  const bytes = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    const byte = code > 0xff ? CP1252[code] : code
    if (byte === undefined) return s
    bytes[i] = byte
  }

  let decoded
  try {
    decoded = utf8.decode(bytes)
  } catch {
    return s
  }

  // The sample ciphertext on the one-time-pad page is arbitrary bytes that
  // happen to decode cleanly, turning visible mojibake into invisible C1
  // controls. Prose never contains those, so a hit means this was not text
  // that had been mangled — leave it alone.
  if (/[-]/.test(decoded)) return s

  return decoded
}

function parseDump(sql) {
  const tables = {}
  const header = /INSERT INTO `([^`]+)`\s*\(([^)]*)\)\s*VALUES\s*/g
  let m

  while ((m = header.exec(sql))) {
    const table = m[1]
    const cols = m[2].split(",").map(c => c.trim().replace(/`/g, ""))
    const { rows, end } = readTuples(sql, header.lastIndex)

    const list = (tables[table] = tables[table] || [])
    for (const row of rows) {
      const obj = {}
      cols.forEach((c, j) => (obj[c] = row[j] ?? null))
      list.push(obj)
    }
    header.lastIndex = end
  }

  return tables
}

// ---------------------------------------------------------------------------
// HTML -> markdown
// ---------------------------------------------------------------------------

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
})

// The detail toggles work by hiding elements with these classes, so the spans
// have to survive the conversion as literal HTML. Markdown passes them through.
turndown.keep(node => node.nodeName === "SPAN" || node.nodeName === "DIV")

const toMarkdown = html =>
  turndown
    .turndown(String(html || "").trim())
    .replace(/\n{3,}/g, "\n\n")
    .trim()

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

const yamlString = v =>
  `"${String(v ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")}"`

const isoDate = d => {
  if (!d) return null
  const dt = new Date(String(d).replace(" ", "T") + "Z")
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10)
}

/** Renders one top-level key as the lines it occupies in the frontmatter. */
function block(key, value) {
  if (value == null) return null
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${key}: []`]
    const lines = [`${key}:`]
    for (const item of value) {
      if (item && typeof item === "object") {
        const entries = Object.entries(item).filter(([, v]) => v != null)
        entries.forEach(([k, v], i) =>
          lines.push(`${i === 0 ? "  - " : "    "}${k}: ${yamlString(v)}`)
        )
      } else {
        lines.push(`  - ${yamlString(item)}`)
      }
    }
    return lines
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return [`${key}: ${value}`]
  }
  // Dates are bare so Gatsby and Decap both read them as dates, not strings.
  if (key === "date" || key === "updated") return [`${key}: ${value}`]
  return [`${key}: ${yamlString(value)}`]
}

/**
 * Splits an existing file into its frontmatter keys and its body. Keys are
 * kept as raw line groups rather than parsed values: anything carried over is
 * then reproduced byte for byte, with no re-serialisation to get wrong.
 */
function readExisting(file) {
  if (!fs.existsSync(file)) return null
  const text = fs.readFileSync(file, "utf8")
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { keys: {}, body: text.trim() }

  const keys = {}
  let current = null
  for (const line of m[1].split("\n")) {
    const key = line.match(/^([A-Za-z_][\w-]*):/)
    if (key) {
      current = key[1]
      keys[current] = [line]
    } else if (current) {
      keys[current].push(line)
    }
  }
  return { keys, body: m[2].trim() }
}

/** True for a key present but empty — `tags: []`, or a stub `links: []`. */
const isEmptyList = lines =>
  lines && lines.length === 1 && /:\s*\[\]\s*$/.test(lines[0])

function compose(order, generated, existing, preserve = PRESERVE) {
  const lines = ["---"]
  for (const key of order) {
    let out = null

    if (preserve.includes(key) && existing && existing.keys[key]) {
      out = existing.keys[key]
    } else if (generated[key] !== undefined) {
      out = block(key, generated[key])
    }

    if (out) lines.push(...out)
  }
  lines.push("---", "", "")
  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(DUMP)) {
    console.error(`No dump at ${DUMP}`)
    process.exit(1)
  }

  const db = parseDump(fs.readFileSync(DUMP, "utf8"))
  const need = ["blog", "project", "tag", "comment", "user"]
  for (const t of need) {
    if (!db[t]) {
      console.error(`Dump has no \`${t}\` table — is this the right file?`)
      process.exit(1)
    }
  }

  const tags = new Map(db.tag.map(t => [t.id, t.name]))
  const users = new Map(db.user.map(u => [u.id, u.fullname || u.name]))

  const tagsFor = (joins, key, id) =>
    (db[joins] || [])
      .filter(j => j[key] === id)
      .map(j => tags.get(j.tag_id))
      .filter(name => name && name.trim())

  // Every anonymous comment was filed against the shared `anon` account, and
  // user_name was never populated. "Anonymous" is the honest label for those.
  const authorOf = c => {
    const name = (c.user_name || "").trim() || users.get(c.user_id) || ""
    return !name || name.toLowerCase() === "anon" ? "Anonymous" : name
  }

  const commentsFor = (type, id) =>
    db.comment
      .filter(c => c.type === type && c.reference_id === id)
      .filter(c => String(c.content || "").trim()) // a few empty spam rows
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map(c => ({
        id: String(c.id),
        author: authorOf(c),
        date: isoDate(c.date),
        body: String(c.content).trim(),
      }))

  const written = []

  // --- Blog -----------------------------------------------------------------
  const blogOrder = [
    "title",
    "date",
    "type",
    "number",
    "excerpt",
    "tags",
    "draft",
    "comments",
  ]

  for (const row of db.blog) {
    const file = path.join(OUT.blog, `${row.title_url}.md`)
    const existing = readExisting(file)
    const comments = commentsFor("blog", row.id)
    const rowTags = tagsFor("blog_tag", "blog_id", row.id)

    const generated = {
      title: row.title,
      date: isoDate(row.date_created) || "1970-01-01",
      type: row.type || "Update",
      number: row.issue,
      excerpt: null,
      tags: rowTags,
      draft: row.privacy === 1,
      comments,
    }

    // A body already converted to markdown stays; only the metadata is
    // refreshed. New posts are converted from the stored HTML.
    const body = existing && existing.body ? existing.body : toMarkdown(row.content)

    write(file, compose(blogOrder, generated, existing) + body + "\n")
    written.push({
      file,
      isNew: !existing,
      tags: rowTags.length,
      comments: comments.length,
      body: existing && existing.body ? "kept" : "converted",
    })
  }

  // --- Projects -------------------------------------------------------------
  // The old page split a project across labelled panels. The new template
  // renders one body, so they become sections in a fixed order.
  const SECTIONS = [
    ["background", null], // the intro — runs straight under the title
    ["instructions", "How to use it"],
    ["details", "Technical details"],
    ["bugs", "Known bugs"],
    ["todo", "To do"],
  ]

  const projectOrder = [
    "title",
    "date",
    "excerpt",
    "status",
    "image",
    "imageCredit",
    "tags",
    "links",
    "draft",
    "comments",
  ]

  for (const row of db.project) {
    if (SKIP_PROJECT_IDS.has(row.id)) continue

    const file = path.join(OUT.projects, `${row.title_url}.md`)
    const existing = readExisting(file)
    const comments = commentsFor("project", row.id)
    const rowTags = tagsFor("project_tag", "project_id", row.id)

    const parts = []
    for (const [col, heading] of SECTIONS) {
      const md = toMarkdown(row[col])
      if (!md) continue
      parts.push(heading ? `## ${heading}\n\n${md}` : md)
    }

    // Curated links win; the dump only fills a gap it left.
    const links = []
    const existingLinks = existing && existing.keys.links
    const keepLinks = existingLinks && !isEmptyList(existingLinks)
    if (!keepLinks) {
      if (row.latest) links.push({ label: "Live app", url: row.latest })
      if (row.source) links.push({ label: "Source", url: row.source })
    }

    const generated = {
      title: row.title,
      date: isoDate(row.date_created) || "1970-01-01",
      excerpt: null,
      status: "Archived",
      tags: rowTags,
      links,
      draft: row.privacy === 1,
      comments,
    }

    const head = compose(
      projectOrder,
      generated,
      existing,
      keepLinks ? [...PRESERVE, "links"] : PRESERVE
    )

    write(file, head + parts.join("\n\n") + "\n")
    written.push({
      file,
      isNew: !existing,
      tags: rowTags.length,
      comments: comments.length,
      body: "converted",
    })
  }

  // --- Report ---------------------------------------------------------------
  for (const w of written) {
    const rel = path.relative(path.join(__dirname, ".."), w.file)
    console.log(
      `${w.isNew ? "new " : "     "}${rel.padEnd(34)} ` +
        `${String(w.tags).padStart(2)} tags  ` +
        `${String(w.comments).padStart(2)} comments  body ${w.body}`
    )
  }
  console.log(
    `\n${written.length} file(s) ${DRY ? "would be written" : "written"}.` +
      (DRY ? " Re-run without --dry." : "")
  )
}

function write(file, text) {
  if (DRY) return
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text, "utf8")
}

main()
