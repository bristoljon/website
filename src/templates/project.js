import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PageHero from "../components/page-hero"
import TagList from "../components/tag-list"
import Comments, { useComments } from "../components/comments"
import DetailToggles, { useDetailLevel } from "../components/detail-toggles"
import { projectUpdates, updateDate } from "../utils/updates"
import ShowMore from "../components/show-more"
import ProjectImages from "../components/project-images"

// The drafting-table photo from the old site, behind every project title
// unless the project sets its own.
const DEFAULT_BACKGROUND = "/img/proj-min.jpg"

const UPDATES_VISIBLE = 5

const Project = ({ data, location }) => {
  const project = data.markdownRemark
  const fm = project.frontmatter
  const detail = useDetailLevel()
  const updates = projectUpdates(project)
  const latest = updates[0]
  const thread = useComments(project.fields.path)

  // Highlight the update a feed link pointed at. :target alone misses it,
  // because Gatsby's client-side navigation doesn't re-evaluate :target.
  const [target, setTarget] = React.useState(null)
  React.useEffect(() => {
    setTarget(decodeURIComponent((location?.hash || "").slice(1)) || null)
  }, [location?.hash])
  const targetIndex = updates.findIndex(u => u.anchor === target)

  // An older update sits in the collapsed part of the list, so the browser
  // can't scroll to it until the list is open. Scroll once it is.
  React.useEffect(() => {
    if (targetIndex >= UPDATES_VISIBLE) {
      document.getElementById(target)?.scrollIntoView()
    }
  }, [target, targetIndex])

  return (
    <Layout>
      <PageHero
        kicker="Project"
        title={fm.title}
        tone="tang"
        background={fm.image || DEFAULT_BACKGROUND}
      >
        <dl className="stats">
          <div className="stat tone-sun">
            <dt>Created</dt>
            <dd>
              <time dateTime={fm.isoDate}>{fm.date}</time>
            </dd>
          </div>
          {latest && (
            <div className="stat tone-grape">
              <dt>Updated</dt>
              <dd>
                <time dateTime={latest.isoDate}>{latest.month}</time>
              </dd>
            </div>
          )}
          <div className="stat tone-pink">
            <dt>Status</dt>
            <dd>{fm.status || "Archived"}</dd>
          </div>
          <div className="stat tone-mint">
            <dt>Comments</dt>
            <dd>{thread.comments ? thread.comments.length : "–"}</dd>
          </div>
        </dl>
      </PageHero>

      <section className="section">
        <div className="wrap project-grid">
          <aside className="project-side">
            <div className="card side-card">
              <h2 className="card-label">Info</h2>
              {fm.links && fm.links.length > 0 ? (
                <ul className="link-buttons">
                  {fm.links.map((l, i) => (
                    <li key={l.url}>
                      <a
                        className={`btn ${i === 0 ? "tone-sun" : ""}`}
                        href={l.url}
                      >
                        {l.label}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No live version.</p>
              )}
            </div>

            <ProjectImages images={fm.images} />

            {fm.tags && fm.tags.length > 0 && (
              <div className="card side-card">
                <h2 className="card-label">Tags</h2>
                <TagList tags={fm.tags} />
              </div>
            )}
          </aside>

          <div className="project-main stack">
            <article className="card article">
              <DetailToggles {...detail} />
              <div
                className={`post-body prose ${detail.bodyClass}`}
                dangerouslySetInnerHTML={{ __html: project.html }}
              />
            </article>

            {updates.length > 0 && (
              <section className="updates" aria-labelledby="updates-heading">
                <h2 id="updates-heading" className="section-title">
                  Updates
                </h2>
                <ShowMore
                  className="update-list"
                  items={updates}
                  visible={UPDATES_VISIBLE}
                  open={targetIndex >= UPDATES_VISIBLE}
                  renderItem={u => (
                    <li
                      className={`update ${target === u.anchor ? "is-target" : ""}`}
                      id={u.anchor}
                      key={u.anchor}
                    >
                      <p className="update-date">
                        <time dateTime={u.isoDate}>{updateDate(u)}</time>
                      </p>
                      <h3 className="update-title">{u.title}</h3>
                      <div
                        className="prose update-body"
                        dangerouslySetInnerHTML={{ __html: u.html }}
                      />
                    </li>
                  )}
                />
              </section>
            )}

            <Comments path={project.fields.path} {...thread} />
          </div>
        </div>
      </section>
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
      fields {
        path
      }
      frontmatter {
        title
        date(formatString: "MMMM YYYY")
        isoDate: date
        excerpt
        status
        image
        images {
          image
          caption
        }
        tags
        links {
          label
          url
        }
        updates {
          title
          html
          approxDate
          date(formatString: "D MMMM YYYY")
          month: date(formatString: "MMMM YYYY")
          isoDate: date
        }
      }
    }
  }
`
