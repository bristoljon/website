import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import ShowMore from "../components/show-more"
import RelativeTime from "../components/relative-time"
import { byNewest, plainExcerpt, projectUpdates, updateDate } from "../utils/updates"

// Accent per kind of item, so the feed reads at a glance.
const KIND_TONE = { blog: "pink", project: "tang", update: "sky" }


// Photo credit in the corner of the hero, linked to its source if given.
const Credit = ({ className, text, url }) =>
  text ? (
    <p className={className}>{url ? <a href={url}>{text}</a> : text}</p>
  ) : null

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
        label: isBlog ? node.frontmatter.type || "Update" : "New project",
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
        label: "Project update",
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
      {/* The CMS "Hero image" fills the band, darkened behind the text. */}
      <section
        id="home"
        className={`hero-home${hero.image ? " hero-home--photo" : ""}`}
        style={
          hero.image
            ? {
                "--hero-bg": `url(${hero.image})`,
                "--hero-bg-dark": `url(${hero.imageDark || hero.image})`,
              }
            : undefined
        }
      >
        <div className="wrap">
          <div className="hero-copy">
            <h1 className="hero-title">
              {word}
              {tld && <span className="hero-tld">{tld}</span>}
            </h1>
            {hero.excerpt && <p className="hero-lede">{hero.excerpt}</p>}
          </div>
        </div>
        {hero.image &&
          (hero.imageDark ? (
            // Separate dark-mode photo: each credit shows with its photo.
            <>
              <Credit
                className="hero-credit hero-credit--light"
                text={hero.imageCredit}
                url={hero.imageCreditUrl}
              />
              <Credit
                className="hero-credit hero-credit--dark"
                text={hero.imageDarkCredit}
                url={hero.imageDarkCreditUrl}
              />
            </>
          ) : (
            <Credit
              className="hero-credit"
              text={hero.imageCredit}
              url={hero.imageCreditUrl}
            />
          ))}
      </section>

      {/*
        Replaces the Angular {{ update.title }} widget that polled
        /php/updates.php. Built at deploy time from the markdown, so it renders
        with the page and is indexable.
      */}
      <section id="recent" className="section recent" aria-labelledby="recent-heading">
        <div className="wrap">
          <header className="section-head">
            <h2 id="recent-heading" className="kicker">
              01 / Recent updates
            </h2>
          </header>

          <ShowMore
            className="feed-list"
            items={recent}
            renderItem={item => (
              <li className={`feed-item tone-${KIND_TONE[item.kind]}`} key={item.key}>
                <div className="feed-when">
                  <RelativeTime
                    className="feed-date"
                    iso={item.isoDate}
                    date={item.date}
                  />
                  <span className="feed-type">{item.label}</span>
                </div>
                <div className="feed-body">
                  {item.project && <p className="feed-project">{item.project}</p>}
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

// WebSite data is what Google uses for the site name shown above results.
export const Head = ({ location }) => (
  <Seo
    pathname={location.pathname}
    jsonLd={[
      {
        "@type": "WebSite",
        name: "bristoljon.uk",
        url: "https://bristoljon.uk/",
      },
      {
        "@type": "Person",
        name: "Jon Wyatt",
        url: "https://bristoljon.uk/",
        sameAs: [
          "https://github.com/bristoljon",
          "https://uk.linkedin.com/in/bristoljon",
          "https://twitter.com/brisjon",
          "https://facebook.com/bristoljon",
        ],
      },
    ]}
  />
)

export const query = graphql`
  {
    home: markdownRemark(fields: { collection: { eq: "pages" }, slug: { eq: "home" } }) {
      html
      frontmatter {
        title
        excerpt
        image
        imageCredit
        imageCreditUrl
        imageDark
        imageDarkCredit
        imageDarkCreditUrl
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
