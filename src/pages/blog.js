import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PageHero from "../components/page-hero"
import TagList from "../components/tag-list"
import { useCommentCounts } from "../components/comments"

// Accent by kind of post.
const toneFor = type => (type === "Geek Blog" ? "grape" : "sky")
const pad = n => String(n).padStart(2, "0")

/**
 * The old tags panel did an AJAX call to a PHP script that JOINed through the
 * blog_tag association table. Tags now live in frontmatter, so filtering is
 * just an array check — no request, no join.
 */
const BlogIndex = ({ data, location }) => {
  const posts = data.posts.nodes
  const commentCounts = useCommentCounts()

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
      <PageHero title="Blog" tone="pink" image="/img/pano-min.jpg">
        <p className="page-lede">
          Part journal, part blog, part collaboration station.
        </p>
      </PageHero>

      <section className="section">
        <div className="wrap narrow">
          {allTags.length > 0 && (
            <div className="card tag-filter">
              <h2 className="card-label">Filter by tag</h2>
              <TagList tags={allTags} active={activeTag} showAll />
            </div>
          )}

          {activeTag && (
            <p className="filter-note">
              Showing {visible.length} {visible.length === 1 ? "post" : "posts"}{" "}
              tagged <strong>{activeTag}</strong>.{" "}
              <Link to="/blog">Show everything</Link>
            </p>
          )}

          <ol className="post-list">
            {visible.map(post => {
              const fm = post.frontmatter
              const count = commentCounts[post.fields.path] || 0
              return (
                <li
                  className={`card post-card tone-${toneFor(fm.type)}`}
                  key={post.id}
                >
                  <span className="post-num" aria-hidden="true">
                    {fm.number != null ? `#${pad(fm.number)}` : "#--"}
                  </span>
                  <div className="post-card-body">
                    <div className="feed-meta">
                      <span className="chip">{fm.type || "Update"}</span>
                      <time dateTime={fm.isoDate}>{fm.date}</time>
                      {count > 0 && (
                        <span className="meta-extra">
                          {count} {count === 1 ? "comment" : "comments"}
                        </span>
                      )}
                    </div>
                    <h2 className="post-card-title">
                      <Link className="stretched" to={post.fields.path}>
                        {fm.title}
                      </Link>
                    </h2>
                    <p>{fm.excerpt || post.excerpt}</p>
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
          type
          number
          tags
          date(formatString: "D MMMM YYYY")
          isoDate: date
        }
      }
    }
  }
`
