import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const NotFound = () => (
  <Layout>
    <header className="page-head">
      <h1>Nothing here</h1>
      <p>
        That page has moved or never existed. Try the{" "}
        <Link to="/blog">blog</Link> or head <Link to="/">home</Link>.
      </p>
    </header>
  </Layout>
)

export default NotFound

export const Head = () => <Seo title="Page not found" />
