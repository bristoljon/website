import * as React from "react"

/**
 * The coloured title band at the top of every page except the homepage. It
 * replaces the old .jumbo photo header; the photo is still there, framed as a
 * tilted card on wide screens.
 */
const PageHero = ({ kicker, title, tone = "sun", image, children }) => (
  <section className={`page-hero tone-${tone}`}>
    <div className="wrap page-hero-grid">
      <div className="page-hero-copy">
        {kicker && <p className="sticker">{kicker}</p>}
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
