import * as React from "react"

/**
 * Your "experimental feature" from Update 3, kept intact: the post body carries
 * <div class="tech"> and <div class="pain"> blocks and these buttons show or
 * hide them. Same mechanism as the original, just driven by React state on the
 * wrapper instead of jQuery on the elements.
 *
 * Non-technical is always visible — it's the baseline, not a third filter.
 */
export const useDetailLevel = () => {
  const [showTech, setShowTech] = React.useState(false)
  const [showPain, setShowPain] = React.useState(false)

  const bodyClass = [
    showTech ? "show-tech" : "hide-tech",
    showPain ? "show-pain" : "hide-pain",
  ].join(" ")

  return { showTech, setShowTech, showPain, setShowPain, bodyClass }
}

const DetailToggles = ({ showTech, setShowTech, showPain, setShowPain }) => (
  <div className="detail-toggles" role="group" aria-label="Detail level">
    <span className="detail-label">Detail</span>
    <button
      type="button"
      className={showTech ? "is-on" : ""}
      aria-pressed={showTech}
      onClick={() => setShowTech(!showTech)}
    >
      Technical
    </button>
    <button
      type="button"
      className={showPain ? "is-on" : ""}
      aria-pressed={showPain}
      onClick={() => setShowPain(!showPain)}
    >
      Bring the pain!
    </button>
  </div>
)

export default DetailToggles
