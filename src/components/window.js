import * as React from "react"

/**
 * A card dressed as an editor window: a title bar with a filename (and
 * optional right-hand meta), then the content.
 */
const Window = ({ name, meta, as: Tag = "div", className = "", children }) => (
  <Tag className={`card window ${className}`}>
    <div className="window-bar">
      <span className="window-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="window-name">{name}</span>
      {meta && <span className="window-meta">{meta}</span>}
    </div>
    <div className="window-body">{children}</div>
  </Tag>
)

export default Window
