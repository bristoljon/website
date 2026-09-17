const path = require("path")

/**
 * Explicit types. Without these, Gatsby infers frontmatter shape from whatever
 * happens to be in the files — so a post with no comments yet breaks the build
 * for every other post's `comments { ... }` selection. Declaring them up front
 * means empty is always valid.
 */
exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Fields {
      slug: String
      collection: String
      path: String
    }

    type Frontmatter @infer {
      title: String
      date: Date @dateformat
      updated: Date @dateformat
      type: String
      number: Int
      excerpt: String
      image: String
      imageCredit: String
      aboutHeading: String
      status: String
      tags: [String]
      links: [Link]
      comments: [Comment]
      draft: Boolean
    }

    type Link {
      label: String
      url: String
    }

    type Comment {
      id: String
      author: String
      date: Date @dateformat
      body: String
    }
  `)
}

/**
 * Slug is the filename, deliberately: content/blog/update-1.md -> /blog/update-1,
 * content/projects/timeismoney.md -> /project/timeismoney. That keeps every
 * existing URL (and every inbound link in the old posts) working unchanged.
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type !== "MarkdownRemark") return

  const fileNode = getNode(node.parent)
  if (!fileNode) return

  const collection = fileNode.sourceInstanceName
  const slug = fileNode.name

  let urlPath = null
  if (collection === "blog") urlPath = `/blog/${slug}`
  if (collection === "projects") urlPath = `/project/${slug}`

  actions.createNodeField({ node, name: "slug", value: slug })
  actions.createNodeField({ node, name: "collection", value: collection })
  actions.createNodeField({ node, name: "path", value: urlPath })
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage, createRedirect } = actions

  const result = await graphql(`
    {
      allMarkdownRemark(
        filter: { fields: { path: { ne: null } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        nodes {
          id
          fields {
            slug
            collection
            path
          }
          frontmatter {
            title
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild("Error loading content", result.errors)
    return
  }

  const templates = {
    blog: path.resolve("./src/templates/blog-post.js"),
    projects: path.resolve("./src/templates/project.js"),
  }

  const nodes = result.data.allMarkdownRemark.nodes
  const byCollection = nodes.reduce((acc, n) => {
    ;(acc[n.fields.collection] = acc[n.fields.collection] || []).push(n)
    return acc
  }, {})

  Object.entries(byCollection).forEach(([collection, items]) => {
    if (!templates[collection]) return

    items.forEach((node, i) => {
      const ref = n =>
        n ? { path: n.fields.path, title: n.frontmatter.title } : null

      createPage({
        path: node.fields.path,
        component: templates[collection],
        context: {
          id: node.id,
          slug: node.fields.slug,
          // Sorted newest-first, so the *next* item in the array is older.
          next: ref(items[i + 1]),
          previous: ref(items[i - 1]),
        },
      })
    })
  })

  // Legacy PHP URLs. The old .htaccess rewrote /blog/update-3 to
  // /blog/index.php?blog=update-3 — anything that leaked the real URL
  // should still land somewhere sensible.
  createRedirect({
    fromPath: "/blog/index.php",
    toPath: "/blog",
    isPermanent: true,
  })
  createRedirect({
    fromPath: "/project/index.php",
    toPath: "/#projects",
    isPermanent: true,
  })
  createRedirect({ fromPath: "/index.html", toPath: "/", isPermanent: true })
  createRedirect({ fromPath: "/index.php", toPath: "/", isPermanent: true })
}
