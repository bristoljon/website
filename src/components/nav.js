import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

/**
 * Same information architecture as the PHP navbar, minus the Login dropdown
 * and the "Get involved" sign-up modal — both of those were backed by the
 * $_SESSION / users table and have no home on a static build.
 *
 * Projects and Blog are pulled from content so the menu can't drift from
 * what's actually published.
 */
const Nav = () => {
  const data = useStaticQuery(graphql`
    {
      projects: allMarkdownRemark(
        filter: {
          fields: { collection: { eq: "projects" } }
          frontmatter: { draft: { ne: true } }
        }
        sort: { frontmatter: { date: ASC } }
      ) {
        nodes {
          fields { path }
          frontmatter { title }
        }
      }
      posts: allMarkdownRemark(
        filter: {
          fields: { collection: { eq: "blog" } }
          frontmatter: { draft: { ne: true } }
        }
        sort: { frontmatter: { date: DESC } }
      ) {
        nodes {
          fields { path }
          frontmatter { title number type }
        }
      }
    }
  `)

  const [open, setOpen] = React.useState(null)
  const toggle = key => setOpen(open === key ? null : key)

  // The standalone mini-apps. These are plain files in /static, carried over
  // from the old docroot — see README, "Legacy apps".
  const misc = [
    { label: "Sudoku Solver", href: "/projects/sudoku/" },
    { label: "'Suncalc'", href: "/projects/suncalc/" },
    { label: "Box Shadows", href: "/projects/shader/" },
    { label: "Alcohol Unit Calculator", href: "/projects/drinkscalc/" },
    { label: "Touch Timer", href: "/projects/taptimer/" },
    { label: "3D Viewer", href: "/3d2/" },
    { label: "Dozenal Calculator", href: "/dozenal/" },
  ]

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          bristoljon<span>.uk</span>
        </Link>

        <button
          className="nav-burger"
          aria-expanded={open === "mobile"}
          aria-label="Toggle navigation"
          onClick={() => toggle("mobile")}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-menu ${open === "mobile" ? "is-open" : ""}`}>
          <li className="has-sub">
            <button onClick={() => toggle("projects")} aria-expanded={open === "projects"}>
              Projects
            </button>
            <ul className={open === "projects" ? "sub is-open" : "sub"}>
              {data.projects.nodes.map(p => (
                <li key={p.fields.path}>
                  <Link to={p.fields.path}>{p.frontmatter.title}</Link>
                </li>
              ))}
            </ul>
          </li>

          <li className="has-sub">
            <button onClick={() => toggle("blog")} aria-expanded={open === "blog"}>
              Blog
            </button>
            <ul className={open === "blog" ? "sub is-open" : "sub"}>
              {data.posts.nodes.map(p => (
                <li key={p.fields.path}>
                  <Link to={p.fields.path}>{p.frontmatter.title}</Link>
                </li>
              ))}
            </ul>
          </li>

          <li className="has-sub">
            <button onClick={() => toggle("misc")} aria-expanded={open === "misc"}>
              Misc
            </button>
            <ul className={open === "misc" ? "sub is-open" : "sub"}>
              {misc.map(m => (
                <li key={m.href}>
                  <a href={m.href}>{m.label}</a>
                </li>
              ))}
            </ul>
          </li>

          <li><Link to="/#recent">Recent</Link></li>
          <li><Link to="/#about">About</Link></li>
          <li><Link to="/#contact">Contact</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Nav
