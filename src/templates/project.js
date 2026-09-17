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
      <article className="post project">
        <header className="post-head">
          <p className="post-kicker">Project</p>
          <h1>{fm.title}</h1>
          <p className="project-meta">
            {fm.status && <span className={`status status-${fm.status.toLowerCase().replace(/\s+/g, "-")}`}>{fm.status}</span>}
            {fm.date && (
              <time dateTime={fm.isoDate} className="post-date">
                {fm.date}
              </time>
            )}
          </p>

          {fm.links && fm.links.length > 0 && (
            <ul className="project-links">
              {fm.links.map(l => (
                <li key={l.url}>
                  <a href={l.url}>{l.label}</a>
                </li>
              ))}
            </ul>
          )}

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
          dangerouslySetInnerHTML={{ __html: project.html }}
        />

        <Comments comments={fm.comments} />
      </article>
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
