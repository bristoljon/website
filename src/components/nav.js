import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { useLocation } from "@reach/router"

/**
 * Same information architecture as the PHP navbar, minus the Login dropdown
 * and the "Get involved" sign-up modal — both of those were backed by the
 * $_SESSION / users table and have no home on a static build.
 *
 * Projects and Misc are pulled from content so the menu can't drift from
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
            <span aria-hidden="true">/</span>
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

/**
 * Light/dark override. With no choice saved the site follows the system
 * setting; a click flips whichever theme is showing and remembers it. Both
 * icons are rendered and CSS shows the right one, so the server-rendered
 * markup never disagrees with the browser.
 */
const ThemeToggle = () => {
  const flip = () => {
    const root = document.documentElement
    const current =
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    const next = current === "dark" ? "light" : "dark"
    root.setAttribute("data-theme", next)
    try {
      localStorage.setItem("theme", next)
    } catch (e) {
      // Private browsing or storage blocked: the choice just won't persist.
    }
  }

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={flip}
      aria-label="Toggle light or dark theme"
      title="Toggle light or dark theme"
    >
      <svg className="icon-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="icon-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
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

        <ThemeToggle />

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="menu-toggle-bars" aria-hidden="true" />
          <span className="sr-only">{menuOpen ? "Close menu" : "Menu"}</span>
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

            <li>
              <Link className="menu-link" to="/blog">
                Blog
              </Link>
            </li>


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
              <Link className="menu-link" to="/cv">
                CV
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Nav
