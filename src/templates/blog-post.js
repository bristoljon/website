import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Comments from "../components/comments"
import DetailToggles, { useDetailLevel } from "../components/detail-toggles"

const BlogPost = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const fm = post.frontmatter
  const detail = useDetailLevel()
  const { previous, next } = pageContext

  return (
    <Layout>
      {/* blog/index.php: .row.jumbo > .splash, title over the panorama. */}
      <div id="home" className="row jumbo jumbo-blog">
        <div className="container">
          <div className="col-md-8 col-md-offset-2 splash">
            <div className="row">
              <div className="col-md-12 title">
                <h1>{fm.title}</h1>
                <h3>
                  {fm.type || "Update"}
                  {fm.number != null && ` ${fm.number}`} &middot;{" "}
                  <time dateTime={fm.isoDate}>{fm.date}</time>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="content" className="row">
        <div className="container">
          <div className="col-md-8 col-md-offset-2">
            <div className="panel panel-primary">
              <div className="panel-heading">
                {fm.type || "Update"}
                {fm.number != null && ` ${fm.number}`}
              </div>
              <div className="panel-body">
                <DetailToggles {...detail} />
                <div
                  className={`post-body ${detail.bodyClass}`}
                  dangerouslySetInnerHTML={{ __html: post.html }}
                />
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

            <Comments comments={fm.comments} />

            <ul className="pager">
              {previous && (
                <li className="previous">
                  <Link to={previous.path} rel="prev">
                    &larr; {previous.title}
                  </Link>
                </li>
              )}
              {next && (
                <li className="next">
                  <Link to={next.path} rel="next">
                    {next.title} &rarr;
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BlogPost

export const Head = ({ data, location }) => (
  <Seo
    title={data.markdownRemark.frontmatter.title}
    description={data.markdownRemark.excerpt}
    pathname={location.pathname}
  />
)

export const query = graphql`
  query BlogPostById($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      excerpt(pruneLength: 160)
      frontmatter {
        title
        date(formatString: "D MMMM YYYY")
        isoDate: date
        type
        number
        tags
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
