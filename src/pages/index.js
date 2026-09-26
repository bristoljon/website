import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Window from "../components/window"
import ShowMore from "../components/show-more"
import { byNewest, plainExcerpt, projectUpdates, updateDate } from "../utils/updates"

// Accent per kind of item, so the feed reads at a glance.
const KIND_TONE = { blog: "pink", project: "tang", update: "sky" }


const IndexPage = ({ data }) => {
  const home = data.home
  const hero = home?.frontmatter || {}

  // The recent feed mixes posts, new projects and project updates, strictly
  // newest first — the same mix the old /php/updates.php feed served. The
  // first few show; the rest sit behind "Show older".
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

  // "bristoljon.uk" -> "bristoljon" with the ".uk" picked out in colour.
  const title = hero.title || "bristoljon.uk"
  const dot = title.indexOf(".")
  const word = dot > 0 ? title.slice(0, dot) : title
  const tld = dot > 0 ? title.slice(dot) : ""

  return (
    <Layout home>
      <section id="home" className="hero-home">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">
              {word}
              {tld && <span className="hero-tld">{tld}</span>}
              <span className="cursor" aria-hidden="true" />
            </h1>
            {hero.excerpt && <p className="hero-lede">{hero.excerpt}</p>}
            <div className="hero-actions">
              <a className="btn tone-sun" href="#recent">
                What's new <span aria-hidden="true">↓</span>
              </a>
              <Link className="btn" to="/blog">
                Read the blog
              </Link>
              <Link className="btn" to="/cv">
                CV
              </Link>
            </div>
          </div>

          {hero.image && (
            <figure className="hero-photo">
              <div className="photo-frame">
                <img src={hero.image} alt="" />
              </div>
              {hero.imageCredit && (
                <figcaption>
                  <span>fig. 1</span> {hero.imageCredit}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </section>

      {/*
        Replaces the Angular {{ update.title }} widget that polled
        /php/updates.php. Built at deploy time from the markdown, so it renders
        with the page and is indexable.
      */}
      <section id="recent" className="section recent" aria-labelledby="recent-heading">
        <div className="wrap">
          <header className="section-head">
            <p className="kicker">01 / Recent</p>
            <h2 id="recent-heading" className="display">
              Fresh off the press
            </h2>
          </header>

          <ShowMore
            className="feed-list"
            items={recent}
            renderItem={item => (
              <li className={`feed-item tone-${KIND_TONE[item.kind]}`} key={item.key}>
                <time className="feed-date" dateTime={item.isoDate}>
                  {item.date}
                </time>
                <div className="feed-body">
                  <p className="feed-kind">
                    <span className="chip">{item.label}</span>
                    {item.project && (
                      <span className="feed-project">{item.project}</span>
                    )}
                  </p>
                  <h3 className="feed-title">
                    <Link className="stretched" to={item.path}>
                      {item.title}
                    </Link>
                  </h3>
                  <p className="feed-excerpt">{item.excerpt}</p>
                </div>
              </li>
            )}
          />
        </div>
      </section>

      <section id="about" className="section about" aria-labelledby="about-heading">
        <div className="wrap about-grid">
          <header className="about-head">
            <p className="kicker">02 / About</p>
            <h2 id="about-heading" className="display">
              {hero.aboutHeading || "About Me"}
            </h2>
          </header>
          <Window name="about.md" className="about-card">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: home?.html || "" }}
            />
          </Window>
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
  }
`
