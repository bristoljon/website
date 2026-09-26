# Re-enable comments: instant, no sign-up, built-in bot defence

## Context

Comments on posts and projects are archive-only today. The old PHP comment
endpoint is gone, so the archived comments render read-only from each file's
`comments` frontmatter list via `src/components/comments.js`, under a
"Commenting is closed" note. The user wants commenting back with:

- **No sign-up:** a name and a message, nothing else required.
- **Instant publishing:** the user chose this over approve-first.
- **Built-in bot defence only:** no Cloudflare or other third party.

Git-based approaches like Staticman or a pull request per comment don't fit
instant publishing. Giscus and utterances need a GitHub account. So new
comments go into Netlify Blobs, a key-value store that comes with the Netlify
site. They're read live in the browser, and the archived frontmatter
comments stay exactly as they are.

## Approach

### Flow

1. **Submission:** the comment form is a Netlify Form (`name="comment"`),
   like the existing contact form in `src/components/layout.js`. The browser
   POSTs it with JavaScript, so the page doesn't reload.
2. **Spam filter:** Netlify's built-in filter (Akismet plus the honeypot
   field) screens every submission. Only submissions that pass trigger the
   `submission-created` event.
3. **Extra checks:** a `submission-created` function runs its own checks,
   listed below. If they pass, it appends the comment to the page's entry in
   Blobs, keyed by page path.
4. **Display:** a `comments` function serves `GET /api/comments?path=…`. The
   Comments component fetches it after load and merges live comments with
   the archive, oldest first.
5. **After posting:** the new comment appears straight away, marked "just
   now", and the list re-fetches after a few seconds to confirm it.

### Bot defence (built-ins only)

- **Netlify spam filter:** Akismet screening plus the honeypot field
  (`netlify-honeypot="bot-field"`).
- **Time trap:** a hidden `started` field records when the form rendered. The
  function drops submissions made within 3 seconds of that, or more than a
  day after it.
- **Content rules:**
  - The message is 2 to 2000 characters, and the name up to 60 (blank
    becomes "Anonymous").
  - No more than 2 links.
  - HTML tags are stripped. Comments already render as plain paragraphs,
    so nothing is injectable.
- **Rate limit:** each sender, identified by a hash of the IP address from
  the submission payload, gets at most 5 comments per hour. The raw address
  is never stored.
- **Privacy:** a comment stores only an id, the page path, the name, the
  message and the date. Email is optional and is never written to Blobs or
  shown. It stays in Netlify's private submission log, so the user can reply.

### Moderation after the fact

- **Notification:** Netlify Forms emails each submission, once notifications
  are switched on for the "comment" form in the Netlify UI.
- **Moderation page:** a small static page at `/admin/comments/` lists recent
  comments across the site, each with a Delete button.
  - It calls the same function with `DELETE`, authorised by a
    `COMMENTS_ADMIN_KEY` environment variable. The page remembers the key in
    localStorage.
  - `/admin/*` already sends a noindex header.
  - It uses plain HTML and JavaScript, so it doesn't touch Decap at `/admin`.

## Files

- **New `netlify/functions/submission-created.mjs`:** Netlify runs a function
  with this exact name for every verified form submission. It ignores forms
  other than "comment", runs the checks above, and appends the comment to the
  Blobs store `comments` under key `<path>`.
- **New `netlify/functions/comments.mjs`:** a v2 function with
  `config.path = "/api/comments"`.
  - `GET ?path=` returns the page's comments.
  - `GET ?recent=1` returns the latest comments across pages, admin only.
  - `DELETE {path,id}` removes a comment, admin only.
- **`netlify.toml`:** a `[functions] directory = "netlify/functions"` line.
- **`package.json`:** add `@netlify/blobs`.
- **`src/components/comments.js`:**
  - Always render the section, with the heading "Comments" plus a count.
  - Render the archive, then live comments, using the same speech-bubble
    markup and the existing paragraph-splitting renderer.
  - Replace the "Commenting is closed" note with the form: name, optional
    email, message, the hidden `form-name`, `page`, `started` and `bot-field`
    fields, and a Send button.
  - Submit with a `fetch("/", …)` url-encoded POST, which is the standard
    Netlify Forms AJAX pattern.
  - The form must stay in the server-rendered HTML so Netlify's build-time
    form detection finds it. Form detection was switched on earlier this
    session.
- **Blog post and project templates:** `src/templates/blog-post.js` and
  `src/templates/project.js` already render `<Comments comments={fm.comments} />`.
  - Pass the page path as well, e.g. `path={location.pathname}` normalised
    without the trailing slash, so live comments key on `/blog/update-3`.
  - The stats box on project pages counts only archived comments. Leave it,
    or count live comments too after load.
- **`src/styles/global.css`:** style the comment form like the contact form's
  `.field` styles, in the light card style rather than the dark terminal
  panel, plus a small "just now" state.
- **New `static/admin/comments/index.html`:** the moderation page.
- **`README.md`:** rewrite "Turning comments back on" as "Comments" to cover
  how it works, `COMMENTS_ADMIN_KEY`, email notifications and deleting
  comments.

## Setup the user does once

- **Admin key:** add a `COMMENTS_ADMIN_KEY` environment variable in Netlify,
  any long random string.
- **Notifications:** in Netlify, go to Forms, then the "comment" form, then
  Notifications, and add an email notification.

## Verification

1. **Build:** `npm run build` passes, and the built HTML for a post contains
   the `comment` form.
2. **Local server:** run `netlify dev`, which emulates Blobs and functions
   locally, and serve the built site.
   - Invoke the submission handler directly with a sample payload:
     `netlify functions:invoke submission-created --payload '{…}'`. Check
     that `GET /api/comments?path=/blog/update-3` returns it.
   - Check that each of these is rejected: a filled honeypot, a submission
     under 3 seconds, 3 or more links, an over-long message, and a sixth
     submission from the same IP within an hour.
3. **Browser, with Playwright:** load a post and see the archived comments.
   Submit the form and see the new comment appear without a reload. Reload
   and it's still there once the event has written it.
4. **Moderation page:** loads, lists the comment with the admin key, and
   deletes it. It returns 401 without the key.
5. **After deploy:** post a real test comment on the live site, confirm the
   notification email arrives, then delete the comment from the moderation
   page.

## Notes

- **Timing:** Netlify's `submission-created` event runs a few seconds after
  submitting. That's why the form shows the comment optimistically, then
  re-fetches.
- **Indexing:** live comments load in the browser, so search engines won't
  index them. Archived comments are still in the static HTML.
- **Separate from Decap:** this doesn't depend on the unfinished Decap login
  switch, the move from Git Gateway to GitHub sign-in.
