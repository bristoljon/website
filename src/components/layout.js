import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Nav from "./nav"
import "../styles/global.css"

const Layout = ({ children, wide }) => {
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
    <>
      <Nav />
      <main className={wide ? "main main-wide" : "main"}>{children}</main>

      <footer className="footer" id="contact">
        <div className="footer-inner">
          <section className="footer-block">
            <h2>Connect on..</h2>
            <ul className="social">
              <li><a href={social.github}>GitHub</a></li>
              <li><a href={social.linkedin}>LinkedIn</a></li>
              <li><a href={social.twitter}>Twitter</a></li>
              <li><a href={social.facebook}>Facebook</a></li>
            </ul>
          </section>

          <section className="footer-block">
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
              className="contact-form"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hp">
                <label>
                  Leave this empty <input name="bot-field" />
                </label>
              </p>
              <label htmlFor="cf-name">Name</label>
              <input id="cf-name" name="name" type="text" required />

              <label htmlFor="cf-email">Email</label>
              <input id="cf-email" name="email" type="email" required />

              <label htmlFor="cf-subject">Subject</label>
              <input id="cf-subject" name="subject" type="text" />

              <label htmlFor="cf-message">Message</label>
              <textarea id="cf-message" name="message" rows="5" required />

              <button type="submit">Send message</button>
            </form>
          </section>
        </div>

        <p className="licence">
          <a
            rel="license"
            href="http://creativecommons.org/licenses/by-sa/4.0/"
          >
            <img
              alt="Creative Commons Licence"
              src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png"
              width="88"
              height="31"
            />
          </a>
          <span>
            Work by {author}, licensed under a{" "}
            <a href="http://creativecommons.org/licenses/by-sa/4.0/">
              Creative Commons Attribution-ShareAlike 4.0 International Licence
            </a>
            .
          </span>
        </p>
      </footer>
    </>
  )
}

export default Layout
