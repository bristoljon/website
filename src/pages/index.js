import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = ({ data }) => {
  const home = data.home
  const hero = home?.frontmatter || {}
  const recent = data.recent.nodes

  return (
    <Layout wide home>
      {/* index.php: .row.jumbo > .container > .col-md-4.col-md-offset-4.splash */}
      <div
        id="home"
        className="row jumbo jumbo-home"
        style={
          hero.image ? { backgroundImage: `url(${hero.image})` } : undefined
        }
      >
        <div className="container">
          <div className="col-md-4 col-md-offset-4 splash">
            <h1>{hero.title || "BRISTOLJON.UK"}</h1>
          </div>
          {hero.imageCredit && <p id="photocred">{hero.imageCredit}</p>}
        </div>
      </div>

      {/*
        Replaces the Angular {{ update.title }} widget that polled
        /php/updates.php. Same panel markup and the same star/pencil icons,
        but built at deploy time from the markdown, so it renders with the
        page and is indexable.
      */}
      <div id="recent" className="row recent">
        <div className="container" id="recents">
          {recent.map(node => {
            const isBlog = node.fields.collection === "blog"
            const kind = isBlog
              ? `New ${node.frontmatter.type || "Update"} Post`
              : "Project"
            return (
              <div className="panel panel-primary update" key={node.id}>
                <div className="panel-body">
                  {/* The old feed read "{type} : {project}" because an update
                      row carried both an update headline and its parent
                      project's name. Markdown has one title, so the kicker is
                      just the kind and the headline sits in the h4 below. */}
                  <i className={isBlog ? "fa fa-pencil" : "fa fa-star"} />{" "}
                  {kind}
                  <div className="pull-right">
                    <time dateTime={node.frontmatter.isoDate}>
                      {node.frontmatter.date}
                    </time>
                  </div>
                  <h4>
                    <Link to={node.fields.path}>{node.frontmatter.title}</Link>
                  </h4>
                  <p>{node.frontmatter.excerpt || node.excerpt}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/*
        The old page hard-coded two About panels side by side. The copy now
        lives in content/pages/home.md as one body, so it renders as a single
        panel in the left-hand column rather than inventing a split point.
      */}
      <div id="about" className="row about">
        <div className="container">
          <div className="col-md-4 col-md-offset-1 panel panel-primary">
            <div className="panel-body">
              <h4>{home?.frontmatter?.aboutHeading || "About Me"}</h4>
              <div dangerouslySetInnerHTML={{ __html: home?.html || "" }} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default IndexPage

export const Head = ({ location }) => <Seo pathname={location.pathname} />

export const query = graphql`
  {
    home: markdownRemark(fields: { collection: { eq: "pages" }, slug: { eq: "home" } }) {
      html
      frontmatter {
        title
        excerpt
        image
        imageCredit
        aboutHeading
      }
    }
    recent: allMarkdownRemark(
      filter: {
        fields: { path: { ne: null } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
      limit: 6
    ) {
      nodes {
        id
        excerpt(pruneLength: 140)
        fields {
          path
          collection
        }
        frontmatter {
          title
          type
          excerpt
          date(formatString: "D MMMM YYYY")
          isoDate: date
        }
      }
    }
  }
`
