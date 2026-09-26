import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PageHero from "../components/page-hero"

/**
 * The small standalone things from the old site that never got a project
 * page. Each entry is a content file in content/misc/ describing a static app
 * served as-is from static/misc/<slug>/.
 */
const MiscIndex = ({ data }) => (
  <Layout>
    <PageHero kicker="Misc" title="Bits and bobs" tone="grape">
      <p className="page-lede">
        Small experiments from when I was learning, kept as they were.
      </p>
    </PageHero>

    <section className="section">
      <div className="wrap narrow">
        <ul className="post-list">
          {data.misc.nodes.map(node => {
            const fm = node.frontmatter
            return (
              <li className="card post-card tone-grape" key={node.fields.href}>
                <span className="post-num" aria-hidden="true">
                  ./
                </span>
                <div className="post-card-body">
                  <div className="feed-meta">
                    <time dateTime={fm.isoDate}>{fm.date}</time>
                  </div>
                  <h2 className="post-card-title">
                    <a href={node.fields.href}>{fm.title}</a>
                  </h2>
                  {fm.excerpt && <p>{fm.excerpt}</p>}
                  <p className="misc-links">
                    <a className="read-more" href={node.fields.href}>
                      Open it →
                    </a>
                    {fm.source && (
                      <a className="read-more" href={fm.source}>
                        Source ↗
                      </a>
                    )}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  </Layout>
)

export default MiscIndex

export const Head = ({ location }) => (
  <Seo title="Misc" pathname={location.pathname} />
)

export const query = graphql`
  {
    misc: allMarkdownRemark(
      filter: {
        fields: { collection: { eq: "misc" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: [{ frontmatter: { date: DESC } }, { frontmatter: { title: ASC } }]
    ) {
      nodes {
        fields {
          href
        }
        frontmatter {
          title
          excerpt
          source
          date(formatString: "MMMM YYYY")
          isoDate: date
        }
      }
    }
  }
`
