import * as React from "react"

/**
 * The header at the top of every page except the homepage: an optional
 * label, the title and whatever meta the page passes in. (The breadcrumb
 * lives in the top bar.) The tone sets the accent colour.
 *
 * `image` sits alongside as a framed photo on wide screens. `background`
 * fills the whole band instead, darkened so the text stays readable, as the
 * old site's project pages did.
 */
const PageHero = ({ kicker, title, tone = "sun", image, background, children }) => (
  <section
    className={`page-hero tone-${tone}${background ? " page-hero--photo" : ""}`}
    style={background ? { "--hero-bg": `url(${background})` } : undefined}
  >
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
