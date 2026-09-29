import * as React from "react"
import { STAGES, stageLevel } from "../utils/stages"

/** The status, with a step meter showing how far up the ladder it is. */
const Stage = ({ status }) => {
  if (!status) return "–"
  const level = stageLevel(status)
  return (
    <>
      {status}
      {level > 0 && (
        <span
          className="stage-meter"
          role="img"
          aria-label={`Stage ${level} of ${STAGES.length}`}
          title={STAGES.join(" → ")}
        >
          {STAGES.map((s, i) => (
            <span key={s} className={i < level ? "is-on" : undefined} />
          ))}
        </span>
      )}
    </>
  )
}

export default Stage
