import * as React from "react"

/**
 * Archived comments only. The old AJAX endpoint (POST to /php/comment.php,
 * comment row inserted, trashcan link keyed on commenter_id) is gone along
 * with the users table, so there's nothing to post to and nobody to
 * authenticate. These are rendered straight out of the post's frontmatter.
 *
 * Markup follows what js/comment_tag.js built for each row — a
 * .panel.panel-info.comment with the name and a user glyph in the heading —
 * so the archive sits in the page looking as it always did. The date is the
 * real one rather than the original's "10 years ago", which ages badly on
 * posts this old.
 *
 * To re-open commenting later, see README > "Turning comments back on".
 */
const Comments = ({ comments = [] }) => {
  if (!comments || comments.length === 0) return null

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="sr-only">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>

      {comments.map((c, i) => (
        <div className="panel panel-info comment" key={c.id || i}>
          <div className="panel-heading">
            <strong className="comment-author">{c.author || "Anonymous"}</strong>{" "}
            <span className="glyphicon glyphicon-user" />
            {c.date && (
              <>
                {" - "}
                <time dateTime={c.date} className="comment-date">
                  {c.date}
                </time>
              </>
            )}
            <span className="glyphicon glyphicon-comment pull-right" />
          </div>
          <div className="panel-body comment-body">
            {String(c.body || "")
              .split(/\n{2,}/)
              .map((para, j) => (
                <p key={j}>{para}</p>
              ))}
          </div>
        </div>
      ))}

      <p className="comments-closed">
        Commenting is closed on the archive. Use the contact form below.
      </p>
    </section>
  )
}

export default Comments
