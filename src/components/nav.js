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

// The standalone mini-apps. These are plain files in /static, carried over
// from the old docroot — see README, "Legacy apps".
const MISC = [
  { label: "Sudoku Solver", href: "/projects/sudoku/" },
  { label: "'Suncalc'", href: "/projects/suncalc/" },
  { label: "Box Shadows", href: "/projects/shader/" },
  { label: "Alcohol Unit Calculator", href: "/projects/drinkscalc/" },
  { label: "Touch Timer", href: "/projects/taptimer/" },
  { label: "3D Viewer", href: "/3d2/" },
  { label: "Dozenal Calculator", href: "/dozenal/" },
]

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
  const [menuOpen, setMenuOpen] = React.useState(false)
  const navRef = React.useRef(null)
  const toggle = key => setOpen(open === key ? null : key)

  // Close an open dropdown on a click elsewhere or on Escape.
  React.useEffect(() => {
    if (open === null && !menuOpen) return undefined
    const onPointer = e => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(null)
        setMenuOpen(false)
      }
    }
    const onKey = e => {
      if (e.key === "Escape") {
        setOpen(null)
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, menuOpen])

  // Following any link in the menu closes it, including same-page #anchors.
  const closeOnLink = e => {
    if (e.target.closest("a")) {
      setOpen(null)
      setMenuOpen(false)
    }
  }

  const dropdown = (key, label, tone, items) => (
    <li className={`dd ${open === key ? "is-open" : ""}`}>
      <button
        type="button"
        className="menu-link dd-toggle"
        aria-expanded={open === key}
        aria-controls={`dd-${key}`}
        onClick={() => toggle(key)}
      >
        {label}
        <span className="caret" aria-hidden="true" />
      </button>
      <ul id={`dd-${key}`} className={`dd-panel tone-${tone}`}>
        {items}
      </ul>
    </li>
  )

  return (
    <header className="topbar" ref={navRef}>
      <div className="wrap topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-text">
            bristoljon<span className="brand-tld">.uk</span>
          </span>
          <span className="sr-only"> — home</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="menu-toggle-bars" aria-hidden="true" />
          {menuOpen ? "Close" : "Menu"}
        </button>

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
        <nav
          id="site-menu"
          className={`menu ${menuOpen ? "is-open" : ""}`}
          aria-label="Main"
          onClick={closeOnLink}
        >
          <ul className="menu-list">
            {dropdown(
              "projects",
              "Projects",
              "sky",
              data.projects.nodes.map(p => (
                <li key={p.fields.path}>
                  <Link to={p.fields.path}>{p.frontmatter.title}</Link>
                </li>
              ))
            )}

            {dropdown(
              "blog",
              "Blog",
              "sun",
              data.posts.nodes.map(p => (
                <li key={p.fields.path}>
                  <Link to={p.fields.path}>{p.frontmatter.title}</Link>
                </li>
              ))
            )}

            {dropdown(
              "misc",
              "Misc",
              "pink",
              MISC.map(m => (
                <li key={m.href}>
                  <a href={m.href}>{m.label}</a>
                </li>
              ))
            )}

            <li>
              <Link className="menu-link" to="/blog">
                All posts
              </Link>
            </li>
            <li>
              <Link className="menu-link" to="/cv">
                CV
              </Link>
            </li>
          </ul>

          <ul className="menu-list menu-list-end">
            <li>
              <Link className="menu-link" to="/#recent">
                Recent
              </Link>
            </li>
            <li>
              <Link className="menu-link" to="/#about">
                About
              </Link>
            </li>
            <li>
              <Link className="menu-link menu-link-cta" to="/#contact">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Nav
