import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

/**
 * The old tags panel did an AJAX call to a PHP script that JOINed through the
 * blog_tag association table. Tags now live in frontmatter, so filtering is
 * just an array check — no request, no join.
 */
const BlogIndex = ({ data, location }) => {
  const posts = data.posts.nodes

  // Read after mount. The server renders the unfiltered list, so reading
  // location.search during render would hydrate to different markup.
  const [activeTag, setActiveTag] = React.useState(null)
  React.useEffect(() => {
    setActiveTag(new URLSearchParams(location.search).get("tag"))
  }, [location.search])

  const allTags = Array.from(
    new Set(posts.flatMap(p => p.frontmatter.tags || []))
  ).sort()

  const visible = activeTag
    ? posts.filter(p => (p.frontmatter.tags || []).includes(activeTag))
    : posts

  return (
    <Layout>
      <div id="home" className="row jumbo jumbo-blog">
        <div className="container">
          <div className="col-md-8 col-md-offset-2 splash">
            <div className="row">
              <div className="col-md-12 title">
                <h1>Blog</h1>
                <h3>Part journal, part blog, part collaboration station.</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="content" className="row">
        <div className="container">
          <div className="col-md-8 col-md-offset-2">
            {allTags.length > 0 && (
              <div className="panel panel-primary tag-filter">
                <div className="panel-heading">Tags</div>
                <div className="panel-body" id="tagcloud">
                  <Link
                    to="/blog"
                    className={`label ${
                      !activeTag ? "label-primary" : "label-default"
                    }`}
                  >
                    All
                  </Link>{" "}
                  {allTags.map(t => (
                    <React.Fragment key={t}>
                      <Link
                        to={`/blog?tag=${encodeURIComponent(t)}`}
                        className={`label ${
                          activeTag === t ? "label-primary" : "label-default"
                        }`}
                      >
                        {t}
                      </Link>{" "}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <div className="post-list">
              {visible.map(post => (
                <div className="panel panel-primary" key={post.id}>
                  <div className="panel-heading">
                    <Link to={post.fields.path}>{post.frontmatter.title}</Link>
                    <span className="pull-right">
                      <time dateTime={post.frontmatter.isoDate}>
                        {post.frontmatter.date}
                      </time>
                    </span>
                  </div>
                  <div className="panel-body">
                    <p>{post.frontmatter.excerpt || post.excerpt}</p>
                    <Link to={post.fields.path}>Read more &rarr;</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BlogIndex

export const Head = ({ location }) => (
  <Seo title="Blog" pathname={location.pathname} />
)

export const query = graphql`
  {
    posts: allMarkdownRemark(
      filter: {
        fields: { collection: { eq: "blog" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        excerpt(pruneLength: 200)
        fields {
          path
        }
        frontmatter {
          title
          excerpt
          tags
          date(formatString: "D MMMM YYYY")
          isoDate: date
          comments {
            id
          }
        }
      }
    }
  }
`
