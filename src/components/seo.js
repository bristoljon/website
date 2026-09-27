import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

// Shared-link preview when a page has no picture of its own.
const DEFAULT_IMAGE = "/img/hero-day.jpg"

/**
 * Head tags for every page. `image` is a site-relative path. Pass `article`
 * ({ published, modified } as ISO dates) on posts and projects: it makes the
 * page an og:article and adds schema.org Article data. `jsonLd` takes any
 * further schema.org objects.
 */
const Seo = ({ title, description, pathname, image, article, jsonLd, children }) => {
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
  const imageUrl = `${meta.siteUrl}${image || DEFAULT_IMAGE}`

  const schemas = [].concat(jsonLd || [])
  if (article) {
    schemas.push({
      "@type": "Article",
      headline: title,
      description: desc,
      url,
      image: imageUrl,
      datePublished: article.published,
      dateModified: article.modified || article.published,
      author: { "@type": "Person", name: meta.author, url: `${meta.siteUrl}/` },
    })
  }

  return (
    <>
      <html lang="en-GB" />
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <meta name="author" content={meta.author} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content={meta.title} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:image" content={imageUrl} />
      {article?.published && (
        <meta property="article:published_time" content={article.published} />
      )}
      {article?.modified && (
        <meta property="article:modified_time" content={article.modified} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@brisjon" />
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ "@context": "https://schema.org", ...schema }),
          }}
        />
      ))}
      {children}
    </>
  )
}

export default Seo
