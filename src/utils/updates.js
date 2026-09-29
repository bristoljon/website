/**
 * Helpers for project updates (the `updates` list in a project's
 * frontmatter). The homepage feed links to each one by its anchor on the
 * project page, so both places build the anchor here.
 */

const slugify = s =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export const updateAnchor = u =>
  `update-${String(u.isoDate || "").slice(0, 10)}-${slugify(u.title)}`

/** "8 December 2021", or "c. August 2015" when only the month is known. */
export const updateDate = u => (u.approxDate ? `c. ${u.month}` : u.date)

/** Newest first. ISO date strings sort correctly as text. */
export const byNewest = (a, b) =>
  String(b.isoDate || "").localeCompare(String(a.isoDate || ""))

/** Plain-text teaser from rendered HTML, cut at a word boundary. */
export const plainExcerpt = (html, max = 140) => {
  const text = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= max) return text
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`
}

/**
 * Sorted updates for one project node, each with its anchor. An update with
 * `type: new` marks when the project started (isNew): it heads the project's
 * timeline, but the homepage feed already lists the project itself as new.
 */
export const projectUpdates = node =>
  (node?.frontmatter?.updates || [])
    .filter(u => u && u.title)
    .map(u => ({ ...u, anchor: updateAnchor(u), isNew: u.type === "new" }))
    .sort(byNewest)
