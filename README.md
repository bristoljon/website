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
| `comment` table, fetched by AJAX | `comments` list in frontmatter, rendered read-only |
| `$_SESSION` log-in, sign-up modal, `user` table | removed |
| PHP mailer on the contact form | Netlify Forms |
| Angular `{{ update.title }}` recent panel | built at deploy time on the homepage |
| `.htaccess` rewrites | Gatsby routes + `netlify.toml` redirects |

URLs are unchanged. `content/blog/update-1.md` builds `/blog/update-1`,
`content/projects/timeismoney.md` builds `/project/timeismoney`. **The filename
is the URL** — renaming a file breaks a live link and every inbound link in the
old posts.

## Comments

Commenting is off: there is no endpoint to post to and no users table to
authenticate against. Existing comments still render, from a `comments` list in
each post's frontmatter:

```yaml
comments:
  - id: "42"
    author: "Dave"
    date: 2015-08-12
    body: "Nice one."
```

They show up in Decap under "Archived comments" on each post, collapsed, so you
can delete anything you don't want up. Nothing new can be added.

**These are empty right now.** Comments were loaded by AJAX, so they aren't in
the rendered HTML and can't be recovered from the live site — they only exist
in the `comment` table. See below.

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

The standalone bits (dozenal, drinkscalc, taptimer, suncalc, shader, 3d2,
onetimepad, sudoku) are plain HTML/CSS/JS and work as-is. Copy them from the
old docroot into `static/projects/<name>/` and they'll be served at
`/projects/<name>/`. `netlify.toml` already redirects the bare paths
(`/dozenal` → `/projects/dozenal/`) so old links keep working.

Two won't come across: `/spoof` and `/stylechanger` both needed PHP at request
time. `netlify.toml` currently points them at `update-1`, which describes them.
Delete those rules if you'd rather they 404.

Also needs copying from the old repo: `static/img/hero.jpg` (the Flickr photo
by @sage_solar) and the `png/` icons the drinks calculator uses.

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

## Turning comments back on

The frontmatter list is deliberately the simplest thing that renders the
archive. If you want live commenting later, the usual git-backed options are a
Netlify Function that commits a file per comment, or Staticman. Both want one
file per comment rather than a list, so you'd move to `content/comments/*.json`
keyed by post slug, add `gatsby-transformer-json`, and join on slug in the
template instead of reading `frontmatter.comments`.

## Notes

- Gatsby 5, React 18, Node 18+.
- `gatsby-node.js` declares the frontmatter schema explicitly. Without it, a
  post with no comments yet breaks the build for every post that queries them.
  `@infer` is left on, so adding a field in Decap won't break the build before
  you've used it in a query.
- No Sharp. Images are plain files in `static/`. Add
  `gatsby-plugin-image`/`gatsby-plugin-sharp` if you start wanting responsive
  project screenshots.
