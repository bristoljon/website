import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PageHero from "../components/page-hero"
import { projectUpdates } from "../utils/updates"

/**
 * /project — every project, newest first. Project pages live under this path
 * (/project/<slug>), so this is where the breadcrumb's "project" goes.
 */
const ProjectIndex = ({ data }) => (
  <Layout>
    <PageHero title="Projects" tone="tang">
      <p className="page-lede">
        Apps, gadgets and half-built ideas, each with its own write-up.
      </p>
    </PageHero>

    <section className="section">
      <div className="wrap narrow">
        <ol className="post-list">
          {data.projects.nodes.map(node => {
            const fm = node.frontmatter
            const latest = projectUpdates(node)[0]
            return (
              <li className="card post-card tone-tang" key={node.fields.path}>
                <span className="post-num" aria-hidden="true">
                  ./
                </span>
                <div className="post-card-body">
                  <div className="feed-meta">
                    <span className="chip">{fm.status || "Archived"}</span>
                    <time dateTime={fm.isoDate}>{fm.date}</time>
                    {latest && (
                      <span className="meta-extra">
                        Updated {latest.month}
                      </span>
                    )}
                  </div>
                  <h2 className="post-card-title">
                    <Link className="stretched" to={node.fields.path}>
                      {fm.title}
                    </Link>
                  </h2>
                  <p>{fm.excerpt || node.excerpt}</p>
                  <span className="read-more" aria-hidden="true">
                    Read more →
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  </Layout>
)

export default ProjectIndex

export const Head = ({ location }) => (
  <Seo title="Projects" pathname={location.pathname} />
)

export const query = graphql`
  {
    projects: allMarkdownRemark(
      filter: {
        fields: { collection: { eq: "projects" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        excerpt(pruneLength: 160)
        fields {
          path
        }
        frontmatter {
          title
          excerpt
          status
          date(formatString: "MMMM YYYY")
          isoDate: date
          updates {
            title
            isoDate: date
            month: date(formatString: "MMMM YYYY")
          }
        }
      }
    }
  }
`
