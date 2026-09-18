const React = require("react")

/**
 * The original site loaded its CSS from <head> in html/head.html: Google's
 * Yanone Kaffeesatz (the splash typeface), Font Awesome 4.3 (the social icons
 * and the star/pencil markers on the updates feed), then Bootstrap 3.
 *
 * Bootstrap is referenced at /css/styles.min.css rather than imported through
 * webpack because the carried-over mini-apps — onetimepad and units — link to
 * that same absolute path. Importing it would bundle a second copy.
 */
exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link
      key="font-yanone"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Yanone+Kaffeesatz&display=swap"
    />,
    <link
      key="font-awesome"
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"
    />,
    <link key="bootstrap" rel="stylesheet" href="/css/styles.min.css" />,
  ])
}
