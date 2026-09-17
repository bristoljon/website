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
      <article className="post">
        <header className="post-head">
          <p className="post-kicker">
            {fm.type || "Update"}
            {fm.number != null && ` ${fm.number}`}
          </p>
          <h1>{fm.title}</h1>
          <time dateTime={fm.isoDate} className="post-date">
            {fm.date}
          </time>

          {fm.tags && fm.tags.length > 0 && (
            <ul className="tags">
              {fm.tags.map(t => (
                <li key={t}>
                  <Link to={`/blog?tag=${encodeURIComponent(t)}`}>{t}</Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        <DetailToggles {...detail} />

        <div
          className={`post-body ${detail.bodyClass}`}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <Comments comments={fm.comments} />

        <nav className="post-nav">
          {previous && (
            <Link to={previous.path} rel="prev">
              ← {previous.title}
            </Link>
          )}
          {next && (
            <Link to={next.path} rel="next">
              {next.title} →
            </Link>
          )}
        </nav>
      </article>
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
