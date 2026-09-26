const React = require("react")

/**
 * Fonts: IBM Plex Sans for headings and body copy, IBM Plex Mono for the
 * labels, paths, dates, tags and anything else that wants to look like a
 * terminal.
 *
 * Bootstrap and Font Awesome are no longer loaded on the Gatsby pages — the
 * site styles itself from src/styles/global.css. /css/styles.min.css stays in
 * /static because the carried-over mini-apps (onetimepad, units, sudoku, 3d2)
 * link to it directly.
 */
exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link
      key="preconnect-fonts"
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />,
    <link
      key="preconnect-gstatic"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key="fonts"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
    />,
  ])
}
