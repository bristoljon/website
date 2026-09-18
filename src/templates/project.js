import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Comments from "../components/comments"
import DetailToggles, { useDetailLevel } from "../components/detail-toggles"

const Project = ({ data }) => {
  const project = data.markdownRemark
  const fm = project.frontmatter
  const detail = useDetailLevel()

  return (
    <Layout>
      {/* project/index.php: .row.jumbo > .col-md-8.col-md-offset-2.splash */}
      <div id="home" className="row jumbo jumbo-project">
        <div className="container">
          <div className="col-md-8 col-md-offset-2 splash">
            <div className="row">
              <div className="col-md-12 title">
                <h1>{fm.title}</h1>
              </div>
            </div>

            <div className="row meta">
              <div className="col-xs-4">
                <p>Created:</p>
                <h4>
                  <time dateTime={fm.isoDate}>{fm.date}</time>
                </h4>
              </div>
              <div className="col-xs-4">
                <p>Status:</p>
                <h4>{fm.status || "Archived"}</h4>
              </div>
              <div className="col-xs-4">
                <p>Comments:</p>
                <h4>{(fm.comments || []).length}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="content" className="row">
        <div className="container">
          <div className="col-md-3">
            <div className="panel panel-primary">
              <div className="panel-heading">Info</div>
              <div className="panel-body">
                {fm.links && fm.links.length > 0 ? (
                  <ul className="list-unstyled">
                    {fm.links.map(l => (
                      <li key={l.url}>
                        <a href={l.url}>{l.label}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No live version.</p>
                )}
              </div>
            </div>

            {fm.tags && fm.tags.length > 0 && (
              <div className="panel panel-primary">
                <div className="panel-heading">Tags</div>
                <div className="panel-body" id="tagcloud">
                  {fm.tags.map(t => (
                    <React.Fragment key={t}>
                      <Link
                        to={`/blog?tag=${encodeURIComponent(t)}`}
                        className="label label-default"
                      >
                        {t}
                      </Link>{" "}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-md-9">
            <div className="panel panel-primary">
              <div className="panel-heading">Project</div>
              <div className="panel-body">
                <DetailToggles {...detail} />
                <div
                  className={`post-body ${detail.bodyClass}`}
                  dangerouslySetInnerHTML={{ __html: project.html }}
                />
              </div>
            </div>

            <Comments comments={fm.comments} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Project

export const Head = ({ data, location }) => (
  <Seo
    title={data.markdownRemark.frontmatter.title}
    description={
      data.markdownRemark.frontmatter.excerpt || data.markdownRemark.excerpt
    }
    pathname={location.pathname}
  />
)

export const query = graphql`
  query ProjectById($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      excerpt(pruneLength: 160)
      frontmatter {
        title
        date(formatString: "MMMM YYYY")
        isoDate: date
        excerpt
        status
        tags
        links {
          label
          url
        }
        comments {
          id
          author
          date(formatString: "D MMMM YYYY")
          body
        }
      }
    }
  }
`
