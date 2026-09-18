import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const NotFound = () => (
  <Layout>
    <div id="home" className="row jumbo jumbo-blog">
      <div className="container">
        <div className="col-md-8 col-md-offset-2 splash">
          <div className="row">
            <div className="col-md-12 title">
              <h1>Nothing here</h1>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="content" className="row">
      <div className="container">
        <div className="col-md-8 col-md-offset-2">
          <div className="panel panel-primary">
            <div className="panel-body">
              <p>
                That page has moved or never existed. Try the{" "}
                <Link to="/blog">blog</Link> or head <Link to="/">home</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
)

export default NotFound

export const Head = () => <Seo title="Page not found" />
