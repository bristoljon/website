import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PageHero from "../components/page-hero"

/**
 * The CV, rendered from content/pages/cv.md (editable in the CMS under
 * Pages > CV). "Download PDF" opens the browser's print dialog; the print
 * stylesheet in global.css strips the site chrome and lays the CV out on A4,
 * so "Save as PDF" gives a clean document named after the title set here.
 */
const bare = url => String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")

const CvPage = ({ data }) => {
  const fm = data.cv?.frontmatter || {}
  const name = fm.name || "CV"

  const contacts = [
    fm.location && { label: fm.location },
    fm.address && { label: fm.address },
    fm.email && { label: fm.email, href: `mailto:${fm.email}` },
    fm.phone && { label: fm.phone, href: `tel:${fm.phone.replace(/\s+/g, "")}` },
    fm.website && { label: bare(fm.website), href: fm.website },
    fm.github && { label: bare(fm.github), href: fm.github },
    fm.linkedin && { label: bare(fm.linkedin), href: fm.linkedin },
  ].filter(Boolean)

  const downloadPdf = () => {
    // Browsers use the document title as the default PDF filename.
    const previous = document.title
    document.title = `${name} CV`
    const restore = () => {
      document.title = previous
      window.removeEventListener("afterprint", restore)
    }
    window.addEventListener("afterprint", restore)
    window.print()
  }

  const contactList = (
    <ul className="cv-contacts">
      {contacts.map(c => (
        <li key={c.label}>
          {c.href ? <a href={c.href}>{c.label}</a> : c.label}
        </li>
      ))}
    </ul>
  )

  return (
    <Layout>
      <PageHero kicker="Curriculum vitae" title={name} tone="mint">
        {fm.headline && <p className="page-lede">{fm.headline}</p>}
        {contactList}
        <div className="hero-actions cv-actions">
          <button type="button" className="btn tone-pink btn-big" onClick={downloadPdf}>
            Download PDF <span aria-hidden="true">↓</span>
          </button>
          {fm.email && (
            <a className="btn tone-paper btn-big" href={`mailto:${fm.email}`}>
              Email me
            </a>
          )}
        </div>
        <p className="cv-hint">
          Opens your print dialog. Choose “Save as PDF”.
        </p>
      </PageHero>

      <section className="section cv-section-wrap">
        <div className="wrap cv-wrap">
          <article className="card cv-sheet">
            {/* Only printed: the on-screen hero is hidden in the PDF. */}
            <header className="cv-print-head">
              <h1>{name}</h1>
              {fm.headline && <p className="cv-print-headline">{fm.headline}</p>}
              {contactList}
            </header>

            {fm.profile && (
              <section className="cv-block">
                <h2 className="cv-h">Profile</h2>
                <p className="cv-profile">{fm.profile}</p>
              </section>
            )}

            {fm.skills && fm.skills.length > 0 && (
              <section className="cv-block">
                <h2 className="cv-h">Tech</h2>
                <ul className="tags cv-skills">
                  {fm.skills.map(s => (
                    <li key={s}>
                      <span className="tag">{s}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {fm.work && fm.work.length > 0 && (
              <section className="cv-block">
                <h2 className="cv-h">Work</h2>
                <ol className="cv-jobs">
                  {fm.work.map((job, i) =>
                    job.aside && !job.company ? (
                      <li className="cv-aside" key={i}>
                        <p>{job.aside}</p>
                      </li>
                    ) : (
                      <li className="cv-job" key={i}>
                        <div className="cv-job-head">
                          <h3>
                            {job.url ? <a href={job.url}>{job.company}</a> : job.company}
                          </h3>
                          <p className="cv-job-meta">
                            {[job.location, job.dates].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {job.title && <p className="cv-role">{job.title}</p>}
                        {job.summary && <p>{job.summary}</p>}
                        {job.highlights && job.highlights.length > 0 && (
                          <ul className="cv-highlights">
                            {job.highlights.map(h => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        )}
                        {job.aside && <p className="cv-aside-inline">{job.aside}</p>}
                      </li>
                    )
                  )}
                </ol>
              </section>
            )}

            {fm.education && fm.education.length > 0 && (
              <section className="cv-block">
                <h2 className="cv-h">Education</h2>
                <ul className="cv-education">
                  {fm.education.map(e => (
                    <li key={e.qualification}>
                      <strong>{e.qualification}</strong>
                      <span>
                        {[e.school, e.year].filter(Boolean).join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {fm.sideProjects && fm.sideProjects.length > 0 && (
              <section className="cv-block">
                <h2 className="cv-h">Projects</h2>
                <ul className="cv-projects">
                  {fm.sideProjects.map(p => (
                    <li key={p.name}>
                      <h3>
                        {p.name}
                        {p.status && <span className="cv-status">{p.status}</span>}
                      </h3>
                      <p>{p.description}</p>
                    </li>
                  ))}
                </ul>
                {fm.sideProjectsNote && (
                  <p className="cv-note">{fm.sideProjectsNote}</p>
                )}
              </section>
            )}
          </article>
        </div>
      </section>
    </Layout>
  )
}

export default CvPage

export const Head = ({ data, location }) => (
  <Seo
    title="CV"
    description={data.cv?.frontmatter?.profile}
    pathname={location.pathname}
  />
)

export const query = graphql`
  {
    cv: markdownRemark(fields: { collection: { eq: "pages" }, slug: { eq: "cv" } }) {
      frontmatter {
        name
        headline
        location
        address
        email
        phone
        website
        github
        linkedin
        profile
        skills
        work {
          company
          title
          location
          dates
          url
          summary
          highlights
          aside
        }
        education {
          qualification
          school
          year
        }
        sideProjects {
          name
          status
          description
        }
        sideProjectsNote
      }
    }
  }
`
