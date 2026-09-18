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
  const [collapsed, setCollapsed] = React.useState(true)
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

  // Bootstrap 3's dropdowns and the collapsed navbar are jQuery plugins. The
  // markup and classes below are the originals, but React drives .open and
  // .in directly so the site needs no jQuery.
  const dropdown = (key, label, items) => (
    <li className={`dropdown ${open === key ? "open" : ""}`}>
      <a
        href="#"
        className="dropdown-toggle"
        role="button"
        aria-haspopup="true"
        aria-expanded={open === key}
        onClick={e => {
          e.preventDefault()
          toggle(key)
        }}
      >
        {label} <span className="caret" />
      </a>
      <ul className="dropdown-menu inverse-dropdown">{items}</ul>
    </li>
  )

  return (
    <nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className={`navbar-toggle ${collapsed ? "collapsed" : ""}`}
            aria-expanded={!collapsed}
            aria-controls="navbar"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar" />
            <span className="icon-bar" />
            <span className="icon-bar" />
          </button>
          <Link className="navbar-brand" to="/">
            Home
          </Link>
        </div>

        <div
          id="navbar"
          className={`navbar-collapse collapse ${collapsed ? "" : "in"}`}
        >
          <ul className="nav navbar-nav">
            {dropdown(
              "projects",
              "Projects",
              data.projects.nodes.map(p => (
                <li key={p.fields.path}>
                  <Link to={p.fields.path}>{p.frontmatter.title}</Link>
                </li>
              ))
            )}

            {dropdown(
              "blog",
              "Blog",
              data.posts.nodes.map(p => (
                <li key={p.fields.path}>
                  <Link to={p.fields.path}>{p.frontmatter.title}</Link>
                </li>
              ))
            )}

            {dropdown(
              "misc",
              "Misc",
              misc.map(m => (
                <li key={m.href}>
                  <a href={m.href}>{m.label}</a>
                </li>
              ))
            )}

            <li>
              <Link to="/blog">All posts</Link>
            </li>
          </ul>

          <ul className="nav navbar-nav navbar-right">
            <li>
              <Link to="/#recent">Recent</Link>
            </li>
            <li>
              <Link to="/#about">About</Link>
            </li>
            <li>
              <Link to="/#contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Nav
