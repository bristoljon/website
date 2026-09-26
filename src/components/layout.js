import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Nav from "./nav"
import "../styles/global.css"

const Layout = ({ children, home }) => {
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

  const socials = [
    { label: "Facebook", href: social.facebook },
    { label: "Twitter", href: social.twitter },
    { label: "GitHub", href: social.github },
    { label: "LinkedIn", href: social.linkedin },
  ]
  const bare = url =>
    String(url).replace(/^https?:\/\/(www\.|uk\.)?/, "").replace(/\/$/, "")

  return (
    <div className={home ? "site page-home" : "site page"} id="top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>

      {/* html/contact.html, with the PHP/AJAX mailer swapped for Netlify Forms. */}
      <section
        id="contact"
        className="band contact"
        aria-labelledby="contact-heading"
      >
        <div className="wrap contact-grid">
          <div className="contact-intro">
            <p className="kicker">Contact</p>
            <h2 id="contact-heading" className="display">
              Connect on..
            </h2>
            <ul className="social">
              {socials.map(s => (
                <li key={s.label}>
                  <a className="social-link" href={s.href}>
                    <span className="social-label">{s.label}</span>
                    <span className="social-url">{bare(s.href)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="card form-card">
            <h2 className="form-title">Or send me a nice old-fashioned..</h2>

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

              <div className="field-row">
                <label className="field" htmlFor="name">
                  <span>Name</span>
                  <input id="name" name="name" type="text" required />
                </label>
                <label className="field" htmlFor="email">
                  <span>Email</span>
                  <input id="email" name="email" type="email" required />
                </label>
              </div>

              <label className="field" htmlFor="subject">
                <span>Subject</span>
                <input id="subject" name="subject" type="text" />
              </label>

              <label className="field" htmlFor="message">
                <span>Message</span>
                <textarea id="message" name="message" required />
              </label>

              <button type="submit" className="btn tone-sun">
                Send
                <span aria-hidden="true"> ✉</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <p className="footer-mark" aria-hidden="true">
            <span>~/</span>bristoljon.uk <span>$ exit 0</span>
          </p>
          <p className="license">
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
                Creative Commons Attribution-ShareAlike 4.0 International
                Licence
              </a>
              .
            </span>
          </p>
          <a className="btn btn-small" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </footer>
    </div>
  )
}

export default Layout
