/**
 * A project's status is how far the idea has got, from back of an envelope
 * to production: the same ladder as the side projects on the CV. Anything
 * else in `status` still shows, just without a place on the ladder.
 */
export const STAGES = [
  "Back of envelope",
  "Proof of concept",
  "Prototype",
  "MVP",
  "Production",
]

/** 1 to 5 up the ladder, or 0 if the status isn't one of the stages. */
export const stageLevel = status => STAGES.indexOf(status) + 1
