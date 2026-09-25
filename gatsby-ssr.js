const React = require("react")

/**
 * Fonts for the redesign: Bricolage Grotesque does the loud display type and
 * the body copy, Space Mono does the little labels, dates and tags.
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
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Space+Mono:wght@400;700&display=swap"
    />,
  ])
}
