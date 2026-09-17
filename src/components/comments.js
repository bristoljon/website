import * as React from "react"

/**
 * Archived comments only. The old AJAX endpoint (POST to the PHP script,
 * comment row inserted, trashcan link keyed on commenter_id) is gone along
 * with the users table, so there's nothing to post to and nobody to
 * authenticate. These are rendered straight out of the post's frontmatter.
 *
 * To re-open commenting later, see README > "Turning comments back on".
 */
const Comments = ({ comments = [] }) => {
  if (!comments || comments.length === 0) return null

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>

      <ol className="comment-list">
        {comments.map((c, i) => (
          <li key={c.id || i} className="comment">
            <header>
              <span className="comment-author">{c.author || "Anonymous"}</span>
              {c.date && (
                <time dateTime={c.date} className="comment-date">
                  {c.date}
                </time>
              )}
            </header>
            <div className="comment-body">
              {String(c.body || "")
                .split(/\n{2,}/)
                .map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
            </div>
          </li>
        ))}
      </ol>

      <p className="comments-closed">
        Commenting is closed on the archive. Use the contact form below.
      </p>
    </section>
  )
}

export default Comments
