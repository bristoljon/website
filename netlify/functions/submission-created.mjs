import {
  check,
  hashIp,
  LIMITS,
  rateStore,
  updateComments,
} from "../lib/comments.mjs"

/**
 * Netlify runs a function with this exact name for every form submission
 * that gets past its spam filter (Akismet plus the honeypot). This one only
 * cares about the "comment" form: it runs our own checks and, if they pass,
 * publishes the comment straight away.
 *
 * Anything rejected here is dropped quietly. It's still in the Netlify UI
 * under Forms > comment, with the email if one was given, so nothing is lost.
 */

/** At most LIMITS.perHour comments per sender. */
const underRateLimit = async (ip, now) => {
  if (!ip) return true
  const store = rateStore()
  const key = hashIp(ip)
  const since = now - 3600 * 1000
  const recent = ((await store.get(key, { type: "json" })) || []).filter(
    t => t > since
  )
  if (recent.length >= LIMITS.perHour) return false
  await store.setJSON(key, [...recent, now])
  return true
}

export default async req => {
  const { payload } = await req.json()
  if (payload?.form_name !== "comment") return new Response("ignored")

  const data = payload.data || {}
  const [comment, reason] = check(data)
  if (!comment) {
    console.log(`comment dropped: ${reason}`)
    return new Response("dropped")
  }

  if (!(await underRateLimit(data.ip, Date.now()))) {
    console.log("comment dropped: rate limit")
    return new Response("dropped")
  }

  await updateComments(comment.path, list => [...list, comment])
  console.log(`comment ${comment.id} published on ${comment.path}`)
  return new Response("ok")
}
