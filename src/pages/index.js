import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { byNewest, plainExcerpt, projectUpdates, updateDate } from "../utils/updates"

const TONES = ["sun", "sky", "pink", "mint", "tang", "grape"]
const FEED_SIZE = 9

const ICONS = { blog: "✎", project: "★", update: "↻" }

const IndexPage = ({ data }) => {
  const home = data.home
  const hero = home?.frontmatter || {}

  // The recent feed mixes posts, new projects and project updates, newest
  // first — the same mix the old /php/updates.php feed served.
  const recent = [
    ...data.recent.nodes.map(node => {
      const isBlog = node.fields.collection === "blog"
      return {
        key: node.id,
        kind: isBlog ? "blog" : "project",
        label: isBlog ? `New ${node.frontmatter.type || "Update"} Post` : "New Project",
        isoDate: node.frontmatter.isoDate,
        date: node.frontmatter.date,
        title: node.frontmatter.title,
        excerpt: node.frontmatter.excerpt || node.excerpt,
        path: node.fields.path,
      }
    }),
    ...data.withUpdates.nodes.flatMap(node =>
      projectUpdates(node).map(u => ({
        key: `${node.fields.path}#${u.anchor}`,
        kind: "update",
        label: "Project Update",
        project: node.frontmatter.title,
        isoDate: u.isoDate,
        date: updateDate(u),
        title: u.title,
        excerpt: plainExcerpt(u.html),
        path: `${node.fields.path}#${u.anchor}`,
      }))
    ),
  ]
    .sort(byNewest)
    .slice(0, FEED_SIZE)
  const ticker = data.projects.nodes.map(n => n.frontmatter.title)

  // "bristoljon.uk" -> a giant "bristoljon" plus a ".uk" sticker.
  const title = hero.title || "bristoljon.uk"
  const dot = title.indexOf(".")
  const word = dot > 0 ? title.slice(0, dot) : title
  const tld = dot > 0 ? title.slice(dot) : ""

  return (
    <Layout home>
      <section id="home" className="hero-home">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="sticker tone-mint hero-hello">Hello, world!</p>
            <h1 className="hero-title">
              <span className="sr-only">{title}</span>
              <span className="hero-word" aria-hidden="true">
                {[...word].map((ch, i) => (
                  <span className="letter" style={{ "--i": i }} key={i}>
                    {ch}
                  </span>
                ))}
              </span>
              {tld && (
                <span className="hero-tld" aria-hidden="true">
                  {tld}
                </span>
              )}
            </h1>
            {hero.excerpt && <p className="hero-lede">{hero.excerpt}</p>}
            <div className="hero-actions">
              <a className="btn tone-sun btn-big" href="#recent">
                What's new <span aria-hidden="true">↓</span>
              </a>
              <Link className="btn tone-paper btn-big" to="/blog">
                Read the blog
              </Link>
            </div>
          </div>

          {hero.image && (
            <figure className="hero-photo">
              <div className="photo-frame">
                <img src={hero.image} alt="" />
              </div>
              {hero.imageCredit && (
                <figcaption className="tape">{hero.imageCredit}</figcaption>
              )}
              <span className="burst" aria-hidden="true">
                <span>Made in Bristol</span>
              </span>
            </figure>
          )}
        </div>
      </section>

      {ticker.length > 0 && (
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i}>
                {t}
                <b>✦</b>
              </span>
            ))}
          </div>
        </div>
      )}

      {/*
        Replaces the Angular {{ update.title }} widget that polled
        /php/updates.php. Built at deploy time from the markdown, so it renders
        with the page and is indexable.
      */}
      <section id="recent" className="section recent" aria-labelledby="recent-heading">
        <div className="wrap">
          <header className="section-head">
            <p className="kicker">Recent</p>
            <h2 id="recent-heading" className="display">
              Fresh off the press
            </h2>
          </header>

          <ul className="card-grid">
            {recent.map((item, i) => (
              <li
                className={`card feed-card tone-${TONES[i % TONES.length]}`}
                key={item.key}
              >
                <div className="feed-meta">
                  <span className="chip">
                    <span aria-hidden="true">{ICONS[item.kind]} </span>
                    {item.label}
                  </span>
                  <time dateTime={item.isoDate}>{item.date}</time>
                </div>
                {item.project && <p className="feed-project">{item.project}</p>}
                <h3 className="feed-title">
                  <Link className="stretched" to={item.path}>
                    {item.title}
                  </Link>
                </h3>
                <p>{item.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="about" className="section about" aria-labelledby="about-heading">
        <div className="wrap about-grid">
          <header className="about-head">
            <p className="kicker">About</p>
            <h2 id="about-heading" className="display">
              {hero.aboutHeading || "About Me"}
            </h2>
            <div className="about-doodles" aria-hidden="true">
              <span className="doodle doodle-circle" />
              <span className="doodle doodle-square" />
              <span className="doodle doodle-star">✦</span>
            </div>
          </header>
          <div
            className="card about-card prose"
            dangerouslySetInnerHTML={{ __html: home?.html || "" }}
          />
        </div>
      </section>
    </Layout>
  )
}

export default IndexPage

export const Head = ({ location }) => <Seo pathname={location.pathname} />

export const query = graphql`
  {
    home: markdownRemark(fields: { collection: { eq: "pages" }, slug: { eq: "home" } }) {
      html
      frontmatter {
        title
        excerpt
        image
        imageCredit
        aboutHeading
      }
    }
    recent: allMarkdownRemark(
      filter: {
        fields: { path: { ne: null } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
      limit: 9
    ) {
      nodes {
        id
        excerpt(pruneLength: 140)
        fields {
          path
          collection
        }
        frontmatter {
          title
          type
          excerpt
          date(formatString: "D MMMM YYYY")
          isoDate: date
        }
      }
    }
    withUpdates: allMarkdownRemark(
      filter: {
        fields: { collection: { eq: "projects" } }
        frontmatter: { draft: { ne: true } }
      }
    ) {
      nodes {
        fields {
          path
        }
        frontmatter {
          title
          updates {
            title
            html
            approxDate
            date(formatString: "D MMMM YYYY")
            month: date(formatString: "MMMM YYYY")
            isoDate: date
          }
        }
      }
    }
    projects: allMarkdownRemark(
      filter: {
        fields: { collection: { eq: "projects" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        frontmatter {
          title
        }
      }
    }
  }
`
