import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { useLocation } from "@reach/router"

/**
 * Same information architecture as the PHP navbar, minus the Login dropdown
 * and the "Get involved" sign-up modal — both of those were backed by the
 * $_SESSION / users table and have no home on a static build.
 *
 * Projects and Blog are pulled from content so the menu can't drift from
 * what's actually published.
 */

// Section listing pages, so every breadcrumb segment is a link.
const SECTION_LINKS = { blog: "/blog", project: "/project", misc: "/misc" }

const Breadcrumb = () => {
  const { pathname } = useLocation()
  const parts = decodeURIComponent(pathname || "/")
    .split("/")
    .filter(Boolean)

  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/" aria-current={parts.length === 0 ? "page" : undefined}>
            <span aria-hidden="true">~/</span>
            <span className="sr-only">bristoljon.uk home</span>
          </Link>
        </li>
        {parts.map((part, i) => {
          const last = i === parts.length - 1
          const href = SECTION_LINKS[part]
          return (
            <li key={i}>
              {last ? (
                <span aria-current="page">{part}</span>
              ) : href ? (
                <Link to={href}>{part}</Link>
              ) : (
                <span>{part}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

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
      misc: allMarkdownRemark(
        filter: {
          fields: { collection: { eq: "misc" } }
          frontmatter: { draft: { ne: true } }
        }
        sort: [{ frontmatter: { date: DESC } }, { frontmatter: { title: ASC } }]
      ) {
        nodes {
          fields { href }
          frontmatter { title }
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
        <Breadcrumb />

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
              [
                ...data.projects.nodes.map(p => (
                  <li key={p.fields.path}>
                    <Link to={p.fields.path}>{p.frontmatter.title}</Link>
                  </li>
                )),
                <li key="all" className="dd-all">
                  <Link to="/project">All projects</Link>
                </li>,
              ]
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
              [
                ...data.misc.nodes.map(m => (
                  <li key={m.fields.href}>
                    {/* Plain <a>: these are static files, not Gatsby routes. */}
                    <a href={m.fields.href}>{m.frontmatter.title}</a>
                  </li>
                )),
                <li key="all" className="dd-all">
                  <Link to="/misc">All misc</Link>
                </li>,
              ]
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
