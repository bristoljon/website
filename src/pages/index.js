import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = ({ data }) => {
  const home = data.home
  const hero = home?.frontmatter || {}
  const recent = data.recent.nodes

  return (
    <Layout wide>
      <header
        className="hero"
        style={
          hero.image ? { backgroundImage: `url(${hero.image})` } : undefined
        }
      >
        <div className="hero-inner">
          <h1>{hero.title || "bristoljon.uk"}</h1>
          {hero.excerpt && <p className="hero-strap">{hero.excerpt}</p>}
        </div>
        {hero.imageCredit && (
          <p className="hero-credit">{hero.imageCredit}</p>
        )}
      </header>

      {/*
        Replaces the Angular {{ update.title }} widget. Same feed, but it's
        built at deploy time from the markdown rather than fetched from the
        JSON endpoint, so it renders with the page and is indexable.
      */}
      <section className="recent" id="recent">
        <h2>Recent</h2>
        <ul className="recent-list">
          {recent.map(node => (
            <li key={node.id}>
              <Link to={node.fields.path}>
                <span className="recent-type">
                  {node.fields.collection === "blog"
                    ? node.frontmatter.type || "Update"
                    : "Project"}
                </span>
                <h3>{node.frontmatter.title}</h3>
                <time dateTime={node.frontmatter.isoDate}>
                  {node.frontmatter.date}
                </time>
                <p>{node.frontmatter.excerpt || node.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="about" id="about">
        <h2>{home?.frontmatter?.aboutHeading || "About Me"}</h2>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: home?.html || "" }}
        />
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
      limit: 6
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
  }
`
