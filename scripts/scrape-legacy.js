#!/usr/bin/env node
/**
 * Fallback content recovery, for if the database is gone.
 *
 * Pulls each project page off the live site and writes the body into the
 * matching markdown file, leaving frontmatter alone.
 *
 * What this CANNOT recover, because it was never in the HTML:
 *   - comments (loaded by AJAX from the PHP script)
 *   - the tech / pain class markup (the toggles were applied client-side,
 *     and the rendered markup is flattened by extraction)
 *   - real publish dates (pages only showed "N years ago")
 *   - tag associations (also an AJAX call)
 *
 * So treat this as a way to stop losing the prose, not as a migration.
 * Use scripts/migrate-mysql.js if the database still exists.
 *
 *   node scripts/scrape-legacy.js
 *   node scripts/scrape-legacy.js --base http://bristoljon.uk --dry
 */

const fs = require("fs")
const path = require("path")
const TurndownService = require("turndown")

const args = process.argv.slice(2)
const baseIndex = args.indexOf("--base")
const BASE = baseIndex > -1 ? args[baseIndex + 1] : "http://bristoljon.uk"
const DRY = args.includes("--dry")

const DIR = path.join(__dirname, "..", "content", "projects")

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
})

/**
 * The project template wrapped its body in a container between the tags panel
 * and the comments block. Matching on that shape is fragile by nature — if the
 * output looks wrong, widen the selector rather than trusting it.
 */
function extractBody(html) {
  const patterns = [
    /<div[^>]*class="[^"]*\bcontent\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(?:div|section)[^>]*class="[^"]*\bcomment/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/i,
  ]
  for (const re of patterns) {
    const match = html.match(re)
    if (match && match[1].trim().length > 200) return match[1]
  }
  return null
}

function splitFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { fm: null, body: text }
  return { fm: match[1], body: match[2] }
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith(".md"))
  if (files.length === 0) {
    console.error(`No markdown files in ${DIR}`)
    process.exit(1)
  }

  for (const file of files) {
    const slug = path.basename(file, ".md")
    const url = `${BASE}/project/${slug}`

    let html
    try {
      const res = await fetch(url, { redirect: "follow" })
      if (!res.ok) {
        console.warn(`${slug}: HTTP ${res.status}`)
        continue
      }
      html = await res.text()
    } catch (err) {
      console.warn(`${slug}: ${err.message}`)
      continue
    }

    const raw = extractBody(html)
    if (!raw) {
      console.warn(`${slug}: no body matched — check extractBody()`)
      continue
    }

    const markdown = turndown.turndown(raw).trim()
    const full = fs.readFileSync(path.join(DIR, file), "utf8")
    const { fm } = splitFrontmatter(full)

    const next = fm ? `---\n${fm}\n---\n\n${markdown}\n` : `${markdown}\n`

    if (DRY) {
      console.log(`\n--- ${slug} (${markdown.length} chars) ---`)
      console.log(markdown.slice(0, 400))
    } else {
      fs.writeFileSync(path.join(DIR, file), next, "utf8")
      console.log(`${slug}: ${markdown.length} chars written`)
    }
  }

  console.log(
    DRY
      ? "\nDry run. Re-run without --dry to write."
      : "\nBodies written. Set draft: false on the ones you want live."
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
