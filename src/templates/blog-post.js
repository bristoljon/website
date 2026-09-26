import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PageHero from "../components/page-hero"
import TagList from "../components/tag-list"
import Comments, { useComments } from "../components/comments"
import DetailToggles, { useDetailLevel } from "../components/detail-toggles"

const BlogPost = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const fm = post.frontmatter
  const detail = useDetailLevel()
  // Posts are sorted newest-first, so `previous` is newer and `next` older.
  const { previous, next } = pageContext
  const thread = useComments(post.fields.path)
  const count = (thread.comments || []).length

  return (
    <Layout>
      <PageHero
        kicker={`${fm.type || "Update"}${fm.number != null ? ` ${fm.number}` : ""}`}
        title={fm.title}
        tone={fm.type === "Geek Blog" ? "grape" : "sky"}
        image="/img/pano-min.jpg"
      >
        <ul className="hero-meta">
          <li>
            <time dateTime={fm.isoDate}>{fm.date}</time>
          </li>
          {count > 0 && (
            <li>
              {count} {count === 1 ? "comment" : "comments"}
            </li>
          )}
        </ul>
      </PageHero>

      <section className="section">
        <div className="wrap narrow stack">
          <article className="card article">
            <DetailToggles {...detail} />
            <div
              className={`post-body prose ${detail.bodyClass}`}
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </article>

          {fm.tags && fm.tags.length > 0 && (
            <div className="card tag-card">
              <h2 className="card-label">Tags</h2>
              <TagList tags={fm.tags} />
            </div>
          )}

          <Comments path={post.fields.path} {...thread} />

          {(previous || next) && (
            <nav className="pager" aria-label="More posts">
              {previous && (
                <Link className="pager-link pager-prev" to={previous.path} rel="prev">
                  <span className="pager-dir">← Newer</span>
                  <span className="pager-title">{previous.title}</span>
                </Link>
              )}
              {next && (
                <Link className="pager-link pager-next" to={next.path} rel="next">
                  <span className="pager-dir">Older →</span>
                  <span className="pager-title">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
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
      fields {
        path
      }
      frontmatter {
        title
        date(formatString: "D MMMM YYYY")
        isoDate: date
        type
        number
        tags
      }
    }
  }
`
