import * as React from "react"
import { Link } from "gatsby"
import { useLocation } from "@reach/router"

// Section listing pages, so every breadcrumb segment is a link.
const SECTION_LINKS = { blog: "/blog", project: "/project", misc: "/misc" }

/**
 * The page's path, one link per segment. Sits at the top of each page's
 * hero (see page-hero.js); the home link lives in the top bar.
 */
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

export default Breadcrumb
