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
    // Favicon: an orange "/" (the nav's home mark) on a dark tile. SVG for
    // modern browsers, .ico for older ones, a PNG for iOS home screens.
    <link key="icon-ico" rel="icon" href="/favicon.ico" sizes="32x32" />,
    <link key="icon-svg" rel="icon" href="/favicon.svg" type="image/svg+xml" />,
    <link key="apple-icon" rel="apple-touch-icon" href="/apple-touch-icon.png" />,
    <link key="manifest" rel="manifest" href="/site.webmanifest" />,
    // Apply a saved light/dark choice before first paint, so a visitor who
    // picked a theme doesn't see the other one flash first. See nav.js.
    <script
      key="theme"
      dangerouslySetInnerHTML={{
        __html:
          "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
      }}
    />,
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
