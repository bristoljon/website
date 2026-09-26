const path = require("path")
const remark = require("remark")
const toHast = require("mdast-util-to-hast")
const toHtml = require("hast-util-to-html")

// Update bodies are short markdown strings in frontmatter, which
// gatsby-transformer-remark doesn't touch. Raw HTML passes through, as it
// does in post bodies.
const markdownToHtml = md => {
  if (!md) return ""
  const hast = toHast(remark().parse(md), { allowDangerousHtml: true })
  return toHtml(hast, { allowDangerousHtml: true })
}

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
      href: String
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
      updates: [ProjectUpdate]
      comments: [Comment]
      draft: Boolean
      source: String
      name: String
      headline: String
      location: String
      email: String
      phone: String
      address: String
      website: String
      github: String
      linkedin: String
      profile: String
      skills: [String]
      work: [CvJob]
      education: [CvEducation]
      sideProjects: [CvProject]
      sideProjectsNote: String
    }

    # The CV, content/pages/cv.md. A work entry with only "aside" set is
    # the italic line between jobs, e.g. a career break.
    type CvJob {
      company: String
      title: String
      location: String
      dates: String
      url: String
      summary: String
      highlights: [String]
      aside: String
    }

    type CvEducation {
      qualification: String
      school: String
      year: String
    }

    type CvProject {
      name: String
      status: String
      description: String
    }

    type Link {
      label: String
      url: String
    }

    # A dated note on a project. Shown in a timeline on the project page and
    # merged into the homepage's recent feed. approxDate marks a date that is
    # only known to the month (a few from 2015 lost their exact timestamp).
    type ProjectUpdate {
      date: Date @dateformat
      approxDate: Boolean
      title: String
      body: String
      html: String
    }

    type Comment {
      id: String
      author: String
      date: Date @dateformat
      body: String
    }
  `)
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    ProjectUpdate: {
      html: { resolve: source => markdownToHtml(source.body) },
    },
  })
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
  // Misc entries get no page of their own: each one describes a static app
  // served from static/misc/<slug>/. The href is kept separately so these
  // stay out of the homepage feed, which lists everything with a path.
  if (collection === "misc") {
    actions.createNodeField({ node, name: "href", value: `/misc/${slug}/` })
  }

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
    toPath: "/project/",
    isPermanent: true,
  })
  createRedirect({ fromPath: "/index.html", toPath: "/", isPermanent: true })
  createRedirect({ fromPath: "/index.php", toPath: "/", isPermanent: true })
}
