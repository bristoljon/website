import * as React from "react"

/**
 * Archived comments only. The old AJAX endpoint (POST to /php/comment.php,
 * comment row inserted, trashcan link keyed on commenter_id) is gone along
 * with the users table, so there's nothing to post to and nobody to
 * authenticate. These are rendered straight out of the post's frontmatter,
 * as speech bubbles. The date is the real one rather than the original's
 * "10 years ago", which ages badly on posts this old.
 *
 * To re-open commenting later, see README > "Turning comments back on".
 */
const TONES = ["sky", "mint", "sun", "pink"]

const Comments = ({ comments = [] }) => {
  if (!comments || comments.length === 0) return null

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="section-title">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>

      <ol className="comment-list">
        {comments.map((c, i) => (
          <li className="comment" key={c.id || i}>
            <div className={`bubble tone-${TONES[i % TONES.length]}`}>
              {String(c.body || "")
                .split(/\n{2,}/)
                .map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
            </div>
            <p className="comment-by">
              <strong>{c.author || "Anonymous"}</strong>
              {c.date && (
                <>
                  {" · "}
                  <time dateTime={c.date}>{c.date}</time>
                </>
              )}
            </p>
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
