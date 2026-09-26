import * as React from "react"

/**
 * A list in order, with everything after the first few tucked into a native
 * <details> expander. No JavaScript needed to open it, and it's keyboard and
 * screen-reader friendly. `open` forces it open, e.g. when a link points at
 * an item inside.
 */
const ShowMore = ({
  items,
  renderItem,
  className,
  visible = 5,
  noun = "older",
  open = false,
}) => {
  const head = items.slice(0, visible)
  const rest = items.slice(visible)

  return (
    <>
      <ol className={className}>{head.map(renderItem)}</ol>
      {rest.length > 0 && (
        <details className="show-more" open={open || undefined}>
          <summary>
            <span className="when-closed">
              Show {rest.length} {noun}
            </span>
            <span className="when-open">Show fewer</span>
          </summary>
          <ol className={className} start={visible + 1}>
            {rest.map(renderItem)}
          </ol>
        </details>
      )}
    </>
  )
}

export default ShowMore
