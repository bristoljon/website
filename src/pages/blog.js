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
      <header className="page-head">
        <h1>Blog</h1>
        <p>Part journal, part blog, part collaboration station.</p>
      </header>

      {allTags.length > 0 && (
        <ul className="tags tag-filter">
          <li>
            <Link to="/blog" className={!activeTag ? "is-active" : ""}>
              All
            </Link>
          </li>
          {allTags.map(t => (
            <li key={t}>
              <Link
                to={`/blog?tag=${encodeURIComponent(t)}`}
                className={activeTag === t ? "is-active" : ""}
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ul className="post-list">
        {visible.map(post => (
          <li key={post.id}>
            <article>
              <h2>
                <Link to={post.fields.path}>{post.frontmatter.title}</Link>
              </h2>
              <p className="post-meta">
                <time dateTime={post.frontmatter.isoDate}>
                  {post.frontmatter.date}
                </time>
                {post.frontmatter.comments &&
                  post.frontmatter.comments.length > 0 && (
                    <span>
                      {post.frontmatter.comments.length}{" "}
                      {post.frontmatter.comments.length === 1
                        ? "comment"
                        : "comments"}
                    </span>
                  )}
              </p>
              <p>{post.frontmatter.excerpt || post.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="empty">Nothing tagged “{activeTag}” yet.</p>
      )}
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
