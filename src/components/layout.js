import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Nav from "./nav"
import "../styles/global.css"

const Layout = ({ children, wide, home }) => {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          author
          social { facebook twitter github linkedin }
        }
      }
    }
  `)

  const { social, author } = site.siteMetadata

  return (
    <div className={home ? "page-home" : "page"}>
      <Nav />
      <main className={wide ? "main main-wide" : "main"}>{children}</main>

      {/* html/contact.html, with the PHP/AJAX mailer swapped for Netlify Forms. */}
      <div id="contact" className="row contact">
        <a name="contact" aria-hidden="true" />
        <div className="container">
          <div className="col-md-6 col-md-offset-3">
            <h2>Connect on..</h2>
            <div id="socialmedia">
              <a className="pull-left" href={social.facebook}>
                <i className="fa fa-facebook-official fa-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href={social.twitter}>
                <i className="fa fa-twitter fa-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href={social.github}>
                <i className="fa fa-github fa-6" />
                <span className="sr-only">GitHub</span>
              </a>
              <a className="pull-right" href={social.linkedin}>
                <i className="fa fa-linkedin-square fa-6" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>

            <h2>Or send me a nice old-fashioned..</h2>

            {/*
              Netlify Forms replaces the old PHP mailer. The hidden form-name
              input is what Netlify's build-time parser keys on; without it the
              POST 404s. Submissions land in the Netlify UI and can be
              forwarded on with a notification.
            */}
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hp">
                <label>
                  Leave this empty <input name="bot-field" />
                </label>
              </p>

              <div className="form-group">
                <div className="input-group">
                  <span className="input-group-addon">Name </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                    required
                  />
                </div>

                <div className="input-group">
                  <span className="input-group-addon">Email </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    required
                  />
                </div>

                <div className="input-group">
                  <span className="input-group-addon">Subject </span>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className="form-control"
                  />
                </div>

                <div className="input-group">
                  <textarea
                    placeholder="Message"
                    id="textarea"
                    name="message"
                    className="form-control"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-success btn-lg">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="footer">
        <p>
          <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
            <img
              alt="Creative Commons Licence"
              src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png"
              width="88"
              height="31"
            />
          </a>
          <br />
          Work by {author}, licensed under a{" "}
          <a href="http://creativecommons.org/licenses/by-sa/4.0/">
            Creative Commons Attribution-ShareAlike 4.0 International Licence
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default Layout
