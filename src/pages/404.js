import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PageHero from "../components/page-hero"

const NotFound = () => (
  <Layout>
    <PageHero title="Nothing here" tone="pink" />

    <section className="section">
      <div className="wrap narrow">
        <div className="card not-found">
          <p className="not-found-num" aria-hidden="true">
            <span>$</span> cd {"<that page>"}
            <br />
            bash: cd: no such file or directory
          </p>
          <p>
            That page has moved or never existed. Try the{" "}
            <Link to="/blog">blog</Link> or head <Link to="/">home</Link>.
          </p>
        </div>
      </div>
    </section>
  </Layout>
)

export default NotFound

export const Head = () => <Seo title="Page not found" />
