/**
 * Comment rules, shared by the form (src/components/comments.js) and the
 * functions (netlify/lib/comments.mjs), so the browser can tell a person
 * what's wrong instead of their comment being dropped quietly.
 */

export const LIMITS = {
  minElapsed: 3 * 1000, // faster than a person can type a comment
  maxElapsed: 24 * 3600 * 1000, // a stale tab, or a replayed form
  minMessage: 2,
  maxMessage: 2000,
  maxName: 60,
  maxLinks: 2,
  perHour: 5,
}

// The name on comments posted with the admin key and no name typed in.
export const OWNER_NAME = "Jon"

const LINK = /https?:\/\/|www\.|\[url/gi

// Strip tags and control characters. Comments render as plain text, so this
// is tidiness rather than the XSS defence, but nobody needs to see "<b>".
export const clean = s =>
  String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export const cleanName = s => clean(s).replace(/\s+/g, " ")

/*
 * Names only the site owner can post under. A name is reduced to bare
 * letters first, with look-alikes swapped back (0 for o, Cyrillic "о" for
 * Latin "o", accents dropped), so "J0n", "jon.", "Jón" and "Jon Wyatt" all
 * count. Filler like "the real" or "official" around it doesn't help either.
 */
const RESERVED = new Set([
  "jon",
  "jonw",
  "jonwyatt",
  "bristoljon",
  "brisjon",
  "admin",
  "owner",
  "siteowner",
  "author",
])

const LOOKALIKES = {
  0: "o",
  1: "l",
  3: "e",
  4: "a",
  5: "s",
  7: "t",
  "@": "a",
  $: "s",
  "|": "l",
  ј: "j", // Cyrillic
  о: "o", // Cyrillic
  ο: "o", // Greek
  п: "n", // Cyrillic
  ո: "n", // Armenian
}

export const isReservedName = name => {
  const letters = String(name || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/./gu, ch => LOOKALIKES[ch] || ch)
    .replace(/[^a-z]/g, "")
  const core = letters
    .replace(/^(the|real|official|mr|its)+/, "")
    .replace(/(here|real|official|admin)+$/, "")
  return RESERVED.has(letters) || RESERVED.has(core)
}

/**
 * What's wrong with a name and message, in words fit to show the person,
 * or null. The owner can use a reserved name and any number of links.
 */
export const problemWith = ({ name, message }, { owner = false } = {}) => {
  const body = clean(message)
  const who = cleanName(name)
  if (body.length < LIMITS.minMessage) return "Write a message first."
  if (body.length > LIMITS.maxMessage)
    return `That's over ${LIMITS.maxMessage} characters. Try trimming it.`
  if (!owner && (body.match(LINK) || []).length > LIMITS.maxLinks)
    return `At most ${LIMITS.maxLinks} links, please.`
  if (who.length > LIMITS.maxName) return "That name's too long."
  if (!owner && isReservedName(who))
    return "That name's reserved for the site's author. Pick another."
  return null
}
