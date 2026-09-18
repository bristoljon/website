import * as React from "react"

/**
 * Your "experimental feature" from Update 3, kept as it was: the post body
 * carries .tech and .pain spans, and these buttons decide which are visible.
 *
 * The original in blog/index.php was a three-state Bootstrap .btn-group, not
 * two independent switches — Non-technical hid both classes, Technical showed
 * .tech only, and "Bring the pain!" showed both. It loaded with "Bring the
 * pain!" active, so a first-time reader saw everything. Same states here, just
 * React holding which one is active instead of jQuery toggling .active.
 */
const LEVELS = ["nontech", "tech", "pain"]

export const useDetailLevel = () => {
  const [level, setLevel] = React.useState("pain")

  const bodyClass = [
    level === "nontech" ? "hide-tech" : "show-tech",
    level === "pain" ? "show-pain" : "hide-pain",
  ].join(" ")

  return { level, setLevel, bodyClass }
}

const LABELS = {
  nontech: "Non-technical",
  tech: "Technical",
  pain: "Bring the pain!",
}

const DetailToggles = ({ level, setLevel }) => (
  <div
    className="btn-group detail-toggles"
    role="group"
    aria-label="Detail level"
  >
    {LEVELS.map(key => (
      <button
        key={key}
        type="button"
        className={`btn btn-default ${level === key ? "active" : ""}`}
        aria-pressed={level === key}
        onClick={() => setLevel(key)}
      >
        {LABELS[key]}
      </button>
    ))}
  </div>
)

export default DetailToggles
