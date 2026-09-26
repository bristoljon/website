import * as React from "react"

/**
 * A list in order, with everything after the first few tucked into a native
 * <details> expander. Opening it hides the button and the rest of the items
 * carry on seamlessly from the list above; there's no "show fewer". No
 * JavaScript needed, and it's keyboard and screen-reader friendly. `open`
 * forces it open, e.g. when a link points at an item inside.
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
            Show {rest.length} {noun}
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
