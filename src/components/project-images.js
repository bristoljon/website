import * as React from "react"

/**
 * The project's pictures as a grid of thumbnails, like the image panel on the
 * old site. Each thumbnail links to the full-size file, so it works without
 * JavaScript; with it, the image opens in a native <dialog> lightbox instead
 * (Escape, the close button or a click on the backdrop closes it).
 */
const ProjectImages = ({ images }) => {
  const list = (images || []).filter(i => i && i.image)
  const dialogRef = React.useRef(null)
  const [current, setCurrent] = React.useState(null)

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (current !== null && !dialog.open) dialog.showModal()
    if (current === null && dialog.open) dialog.close()
  }, [current])

  if (list.length === 0) return null

  const open = (e, i) => {
    if (!dialogRef.current?.showModal) return // no <dialog> support: follow the link
    e.preventDefault()
    setCurrent(i)
  }
  const step = delta =>
    setCurrent(i => (i + delta + list.length) % list.length)
  const shown = current !== null ? list[current] : null

  return (
    <div className="card side-card">
      <h2 className="card-label">Images</h2>
      <ul className="thumbs">
        {list.map((img, i) => (
          <li key={img.image}>
            <a href={img.image} onClick={e => open(e, i)}>
              <img src={img.image} alt={img.caption || ""} loading="lazy" />
            </a>
          </li>
        ))}
      </ul>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={shown?.caption || "Image"}
        onClose={() => setCurrent(null)}
        onClick={e => {
          if (e.target === e.currentTarget) setCurrent(null)
        }}
        onKeyDown={e => {
          if (list.length < 2) return
          if (e.key === "ArrowRight") step(1)
          if (e.key === "ArrowLeft") step(-1)
        }}
      >
        {shown && (
          <figure>
            <img src={shown.image} alt={shown.caption || ""} />
            <figcaption>
              <span>{shown.caption}</span>
              <span className="lightbox-count">
                {current + 1} / {list.length}
              </span>
            </figcaption>
          </figure>
        )}
        <div className="lightbox-controls">
          {list.length > 1 && (
            <>
              <button type="button" className="btn btn-small" onClick={() => step(-1)}>
                ← Prev
              </button>
              <button type="button" className="btn btn-small" onClick={() => step(1)}>
                Next →
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-small"
            onClick={() => setCurrent(null)}
            autoFocus
          >
            Close
          </button>
        </div>
      </dialog>
    </div>
  )
}

export default ProjectImages
