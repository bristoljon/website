#!/usr/bin/env node
/**
 * Migrate the legacy PHP/MySQL content into markdown.
 *
 * This is the faithful route: it keeps the original HTML in the content
 * columns — including the <div class="tech"> / <div class="pain"> blocks the
 * detail toggles rely on — along with real publish dates, the tag joins, and
 * the comments, which are the one thing that cannot be recovered from the
 * live site (they were loaded by AJAX, so they never appear in the HTML).
 *
 * Two steps:
 *
 *   1. node scripts/migrate-mysql.js --inspect
 *      Prints every table, its columns and its row count. Nothing is written.
 *
 *   2. Edit MAPPING below to match what step 1 printed, then:
 *      node scripts/migrate-mysql.js
 *
 * Connection comes from the environment:
 *   DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME
 *
 * Works against a live database or a dump restored locally:
 *   mysql -u root -p bristoljon < backup.sql
 */

const fs = require("fs")
const path = require("path")
const mysql = require("mysql2/promise")

// ---------------------------------------------------------------------------
// Adjust to match --inspect output. Left side is what this script needs,
// right side is what your schema actually calls it.
// ---------------------------------------------------------------------------
const MAPPING = {
  blog: {
    table: "blog",
    id: "id",
    slug: "url",
    title: "title",
    body: "content",
    date: "date",
    type: "type",
    number: "number",
  },
  project: {
    table: "project",
    id: "id",
    slug: "url",
    title: "title",
    body: "content",
    date: "date",
  },
  tag: {
    table: "tag",
    id: "id",
    name: "name",
  },
  blogTag: {
    table: "blog_tag",
    blogId: "blog_id",
    tagId: "tag_id",
  },
  projectTag: {
    table: "project_tag",
    projectId: "project_id",
    tagId: "tag_id",
  },
  comment: {
    table: "comment",
    id: "id",
    blogId: "blog_id",
    projectId: "project_id",
    userId: "commenter_id",
    body: "comment",
    date: "date",
    // Anonymous comments stored a name directly; logged-in ones stored a
    // user id. Both are handled.
    author: "name",
  },
  user: {
    table: "user",
    id: "id",
    name: "username",
  },
}

const OUT = {
  blog: path.join(__dirname, "..", "content", "blog"),
  project: path.join(__dirname, "..", "content", "projects"),
}

const conn = () =>
  mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "bristoljon",
  })

async function inspect() {
  const db = await conn()
  const [tables] = await db.query("SHOW TABLES")
  for (const row of tables) {
    const name = Object.values(row)[0]
    const [cols] = await db.query(`SHOW COLUMNS FROM \`${name}\``)
    const [[{ n }]] = await db.query(
      `SELECT COUNT(*) AS n FROM \`${name}\``
    )
    console.log(`\n${name}  (${n} rows)`)
    cols.forEach(c => console.log(`   ${c.Field.padEnd(20)} ${c.Type}`))
  }
  await db.end()
}

const yamlString = v => {
  const s = String(v == null ? "" : v)
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

const isoDate = d => {
  if (!d) return null
  const dt = d instanceof Date ? d : new Date(d)
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10)
}

const slugify = s =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

function frontmatter(fields) {
  const lines = ["---"]
  for (const [k, v] of Object.entries(fields)) {
    if (v == null) continue
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`)
      } else if (typeof v[0] === "object") {
        lines.push(`${k}:`)
        v.forEach(item => {
          const entries = Object.entries(item).filter(([, x]) => x != null)
          entries.forEach(([ik, iv], i) => {
            lines.push(`${i === 0 ? "  - " : "    "}${ik}: ${yamlString(iv)}`)
          })
        })
      } else {
        lines.push(`${k}:`)
        v.forEach(item => lines.push(`  - ${yamlString(item)}`))
      }
    } else if (typeof v === "number" || typeof v === "boolean") {
      lines.push(`${k}: ${v}`)
    } else if (k === "date" || k === "updated") {
      lines.push(`${k}: ${v}`)
    } else {
      lines.push(`${k}: ${yamlString(v)}`)
    }
  }
  lines.push("---", "")
  return lines.join("\n")
}

async function safeQuery(db, sql, params) {
  try {
    const [rows] = await db.query(sql, params)
    return rows
  } catch (err) {
    console.warn(`   skipped: ${err.sqlMessage || err.message}`)
    return []
  }
}

async function migrate() {
  const db = await conn()
  const m = MAPPING

  const users = new Map()
  for (const u of await safeQuery(db, `SELECT * FROM \`${m.user.table}\``)) {
    users.set(String(u[m.user.id]), u[m.user.name])
  }

  const tags = new Map()
  for (const t of await safeQuery(db, `SELECT * FROM \`${m.tag.table}\``)) {
    tags.set(String(t[m.tag.id]), t[m.tag.name])
  }

  const collect = async (kind, cfg, joinCfg, joinKey, outDir) => {
    const rows = await safeQuery(db, `SELECT * FROM \`${cfg.table}\``)
    const joins = joinCfg
      ? await safeQuery(db, `SELECT * FROM \`${joinCfg.table}\``)
      : []
    const comments = await safeQuery(
      db,
      `SELECT * FROM \`${m.comment.table}\``
    )

    fs.mkdirSync(outDir, { recursive: true })
    let written = 0

    for (const row of rows) {
      const id = String(row[cfg.id])
      const slug = row[cfg.slug] || slugify(row[cfg.title])

      const rowTags = joins
        .filter(j => String(j[joinKey]) === id)
        .map(j => tags.get(String(j[joinCfg.tagId])))
        .filter(Boolean)

      const ownerCol = kind === "blog" ? m.comment.blogId : m.comment.projectId
      const rowComments = comments
        .filter(c => c[ownerCol] != null && String(c[ownerCol]) === id)
        .map(c => ({
          id: String(c[m.comment.id]),
          author:
            users.get(String(c[m.comment.userId])) ||
            c[m.comment.author] ||
            "Anonymous",
          date: isoDate(c[m.comment.date]),
          body: String(c[m.comment.body] || "").trim(),
        }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))

      const fm = {
        title: row[cfg.title],
        date: isoDate(row[cfg.date]) || "1970-01-01",
        ...(kind === "blog"
          ? { type: row[cfg.type] || "Update", number: row[cfg.number] }
          : { status: "Archived" }),
        tags: rowTags,
        draft: false,
        comments: rowComments,
      }

      const body = String(row[cfg.body] || "").trim()
      fs.writeFileSync(
        path.join(outDir, `${slug}.md`),
        frontmatter(fm) + body + "\n",
        "utf8"
      )
      written++
      console.log(
        `   ${slug}.md  (${rowTags.length} tags, ${rowComments.length} comments)`
      )
    }

    console.log(`${written} ${kind} file(s) written to ${outDir}`)
  }

  console.log("\nBlog")
  await collect("blog", m.blog, m.blogTag, m.blogTag.blogId, OUT.blog)

  console.log("\nProjects")
  await collect(
    "project",
    m.project,
    m.projectTag,
    m.projectTag.projectId,
    OUT.project
  )

  await db.end()
  console.log("\nDone. Review the files, then `npm run develop`.")
}

const run = process.argv.includes("--inspect") ? inspect : migrate
run().catch(err => {
  console.error(err.message)
  process.exit(1)
})
