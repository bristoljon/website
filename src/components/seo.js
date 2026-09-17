import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Seo = ({ title, description, pathname, children }) => {
  const { site } = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
          description
          siteUrl
          author
        }
      }
    }
  `)

  const meta = site.siteMetadata
  const pageTitle = title ? `${title} — ${meta.title}` : meta.title
  const desc = description || meta.description
  const url = `${meta.siteUrl}${pathname || ""}`

  return (
    <>
      <html lang="en-GB" />
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <meta name="author" content={meta.author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content="@brisjon" />
      {children}
    </>
  )
}

export default Seo
