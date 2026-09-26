import * as React from "react"

/**
 * The header at the top of every page except the homepage: an optional
 * label, the title and whatever meta the page passes in. (The breadcrumb
 * lives in the top bar.) The tone sets the accent colour; the photo, if any, sits alongside as a
 * captioned figure on wide screens.
 */
const PageHero = ({ kicker, title, tone = "sun", image, children }) => (
  <section className={`page-hero tone-${tone}`}>
    <div className="wrap page-hero-grid">
      <div className="page-hero-copy">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="page-title">{title}</h1>
        {children}
      </div>
      {image && (
        <div
          className="page-hero-photo"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      )}
    </div>
  </section>
)

export default PageHero
