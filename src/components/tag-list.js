import * as React from "react"
import { Link } from "gatsby"

/**
 * Tags as chunky chips. Every tag links to the blog filtered by it, as the
 * old tag cloud did. `active` marks the current filter on /blog, and
 * `showAll` adds the "All" chip that clears it.
 */
const TagList = ({ tags = [], active, showAll }) => (
  <ul className="tags">
    {showAll && (
      <li>
        <Link
          to="/blog"
          className="tag"
          aria-current={!active ? "true" : undefined}
        >
          All
        </Link>
      </li>
    )}
    {tags.map(t => (
      <li key={t}>
        <Link
          to={`/blog?tag=${encodeURIComponent(t)}`}
          className="tag"
          aria-current={active === t ? "true" : undefined}
        >
          {t}
        </Link>
      </li>
    ))}
  </ul>
)

export default TagList
