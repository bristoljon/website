# bristoljon.uk — Gatsby + Decap CMS + Netlify

A static port of the PHP/MySQL site. Content lives as markdown in `content/`,
edited through Decap CMS at `/admin`, committed to git, built by Gatsby,
deployed by Netlify.

## Run it

```bash
npm install
npm run develop        # http://localhost:8000
```

To edit through the CMS against your working tree rather than GitHub,
uncomment `local_backend: true` in `static/admin/config.yml` and run
`npm run cms` in a second terminal, then open http://localhost:8000/admin.

## What changed

| Was | Now |
| --- | --- |
| `blog` / `project` tables | markdown in `content/blog`, `content/projects` |
| `tag` + `blog_tag` join, fetched by AJAX | `tags` array in frontmatter, filtered client-side on `/blog` |
| `comment` table, fetched by AJAX | Netlify Forms + Netlify Blobs, fetched from `/api/comments` |
| `$_SESSION` log-in, sign-up modal, `user` table | removed |
| PHP mailer on the contact form | Netlify Forms |
| Angular `{{ update.title }}` recent panel | built at deploy time on the homepage |
| `.htaccess` rewrites | Gatsby routes + `netlify.toml` redirects |

URLs are unchanged. `content/blog/update-1.md` builds `/blog/update-1`,
`content/projects/timeismoney.md` builds `/project/timeismoney`. **The filename
is the URL** — renaming a file breaks a live link and every inbound link in the
old posts.

## CV

`/cv` is built from `content/pages/cv.md`, editable in the CMS under
Pages > CV. Jobs are listed newest first; an entry with only `aside` set
renders as the italic line between jobs, such as a career break.

"Download PDF" opens the browser's print dialog. The print styles at the end of
`src/styles/global.css` hide the site chrome and lay the CV out on A4, so
"Save as PDF" produces the document. Phone and address are blank on purpose,
because anything filled in there is public.

## Project updates

Each project can carry an `updates` list in its frontmatter: a date, a title
and a short markdown body. In the CMS it's the "Updates" list on a project,
with new entries added at the top.

```yaml
updates:
  - date: 2021-12-08
    title: "Finally working on v2 now 🎉"
    body: "Rewritten in React. Check it out [here](https://dozenal.netlify.app/)"
```

Updates show as a timeline on the project page, set the project's "Updated"
date, and are mixed into the homepage's recent feed with blog posts and new
projects. Feed cards link straight to the update on the project page.

The existing entries came from the old site's `/php/updates.php` feed and
project pages. Three from 2015 had lost their exact timestamp, so they carry
`approxDate: true` and display as "c. August 2015". The old "Time is Money"
launch note was marked hidden there, so it wasn't brought across.

## Comments

Anyone can comment on a post or project with a name (optional) and a message.
No sign-up, and comments go up straight away. Every comment, including the
36 carried over from the old `comment` table, lives in Netlify Blobs; nothing
is in the markdown.

**How a comment gets published**

1. The form at the bottom of each post is a Netlify Form called `comment`. The
   page posts it with JavaScript and shows the comment as "just now".
2. Netlify's spam filter (Akismet plus a honeypot field) screens it. Anything
   it flags stops there.
3. `netlify/functions/submission-created.mjs` runs on what's left and drops
   anything that:
   - was sent under 3 seconds (or over a day) after the form appeared;
   - has a message under 2 or over 2000 characters, a name over 60, or more
     than 2 links;
   - comes from an IP that has already posted 5 comments in the last hour.
     Only a keyed hash of the IP is stored.

   Otherwise it strips any HTML and appends the comment to the page's list in
   the `comments` Blobs store, keyed by path without the leading slash
   (`blog/update-3`). A stored comment is an id, the path, the name, the
   message and the date. The email field is optional and is never stored or
   shown; it stays in the Netlify UI under Forms so you can reply.
4. `netlify/functions/comments.mjs` serves `/api/comments?path=/blog/update-3`.
   Posts, projects and the `/blog` list fetch it after the page loads.

Dropped comments aren't lost: they're still under Forms > comment in Netlify,
and the function log says why each was dropped. Without JavaScript the form
still submits, but it's dropped by the time check.

Comments load in the browser, so search engines don't index them.

**Setup, once**

- Add a `COMMENTS_ADMIN_KEY` environment variable in Netlify: any long random
  string. It unlocks the moderation page and salts the IP hashes.
- For an email per comment: Forms > comment > Form notifications > add an
  email notification.

**Moderating**

Go to [/admin/comments/](https://bristoljon.uk/admin/comments/) and enter the
admin key. It lists the latest 100 comments across the site, newest first,
each with a Delete button. The key is remembered in that browser until you
click "Forget key".

**The archive**

The old comments were copied into Blobs by
`scripts/migrate-comments-to-blobs.mjs`, which read the `comments` lists that
used to be in the frontmatter. Those lists were removed afterwards, so to run
it again, point it at the last commit that had them:

```bash
node scripts/migrate-comments-to-blobs.mjs --ref 21dcffb --dry
node scripts/migrate-comments-to-blobs.mjs --ref 21dcffb
```

Re-running is safe: archived comments have ids like `legacy-16` and anything
already in the store is skipped. It uses the linked site (`netlify link`) and
your `netlify login`, or `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN`.

**Locally**

`gatsby develop` has no functions, so posts show no comments and the form
can't be sent. `netlify functions:serve` runs both functions against a local
Blobs sandbox, which is enough to try the API with curl.

## Getting your content across

### If the database still exists — do this one

```bash
node scripts/migrate-mysql.js --inspect     # prints tables, columns, row counts
# edit the MAPPING block at the top of the script to match
node scripts/migrate-mysql.js
```

Point it at a live database or a dump restored locally
(`mysql -u root -p bristoljon < backup.sql`). Credentials come from `.env`
(see `.env.example`).

This is the faithful route. It keeps the original HTML in the content columns —
including the `<div class="tech">` and `<div class="pain">` blocks — plus real
dates, the tag joins, and the comments.

### If it doesn't

```bash
node scripts/scrape-legacy.js --dry
node scripts/scrape-legacy.js
```

Pulls project bodies off the live site. It cannot recover comments, tag
associations, real dates, or the tech/pain markup, because none of those were
ever in the HTML.

### Current state of `content/`

- **Blog** — all three posts migrated from the live HTML, with links rewritten
  to the new routes. Two things need your eye: the dates are estimates
  (the pages only ever said "11 years ago"), and in `update-2` / `update-3`
  I've reconstructed which passages sat behind the Technical and
  Bring-the-pain toggles. The SQL migration overwrites both with the real
  values.
- **Projects** — `timeismoney.md` has real content. The other seven are stubs
  with correct slugs, titles and links, marked `draft: true` so they stay off
  the site and out of the menu until a migration fills them in.
- **Homepage** — hero and About text in `content/pages/home.md`, editable in
  Decap under Pages.

## Legacy apps

The old site's standalone pages are plain HTML/CSS/JS, served as-is from
`static/`:

- **`static/projects/<name>/`** holds apps that have a project page: sudoku,
  dozenal, 3d2, onetimepad and units (Time is Money). Their project pages link
  to them.
- **`static/misc/<name>/`** holds the small ones with no project page:
  drinkscalc, suncalc, shader, taptimer, stylechanger and spoof. Each has an
  entry in `content/misc/<name>.md` (title, date, summary, source link). The
  entries drive the Misc menu and the `/misc` page. The filename must match
  the folder.

To add a misc app, drop its files in `static/misc/<name>/` and add
`content/misc/<name>.md`.

Two were PHP. `stylechanger` only used PHP to pick a stylesheet from a form,
so it's now a static page that reads the choice from the URL instead. `spoof`
sent e-mail through PHP's `mail()`, so `/misc/spoof/` is a short archive page
linking the original source.

`netlify.toml` redirects every old address (`/drinkscalc`,
`/projects/drinkscalc/…`, `/stylechanger` and so on) to the new locations.

## Deploying

1. Push to GitHub.
2. Netlify → Add new site → import the repo. Build command and publish
   directory come from `netlify.toml`.
3. Site configuration → Identity → Enable. Set registration to **Invite only**,
   then invite yourself.
4. Identity → Services → **Enable Git Gateway**. This is what lets Decap commit.
5. Set the branch in `static/admin/config.yml` if yours isn't `main`.
6. Point the domain at Netlify and let it issue the certificate — the old site
   is on plain HTTP, so this is a free upgrade.

Identity here logs *you* into `/admin`. It is not the old site log-in; visitors
never see it.

`publish_mode: editorial_workflow` is on, so CMS saves open a PR and get a
deploy preview rather than going straight live. Drop that line if you'd rather
publish directly.

## Notes

- Gatsby 5, React 18, Node 18+.
- `gatsby-node.js` declares the frontmatter schema explicitly. Without it, a
  project with no updates yet breaks the build for every project that queries
  them.
  `@infer` is left on, so adding a field in Decap won't break the build before
  you've used it in a query.
- No Sharp. Images are plain files in `static/`. Add
  `gatsby-plugin-image`/`gatsby-plugin-sharp` if you start wanting responsive
  project screenshots.
