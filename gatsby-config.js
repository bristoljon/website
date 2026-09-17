module.exports = {
  siteMetadata: {
    title: "bristoljon.uk",
    description:
      "Part journal, part blog, part collaboration station. Projects, experiments and write-ups by Jon Wyatt.",
    siteUrl: "https://bristoljon.uk",
    author: "Jon Wyatt",
    social: {
      facebook: "https://facebook.com/bristoljon",
      twitter: "https://twitter.com/brisjon",
      github: "https://github.com/bristoljon",
      linkedin: "https://uk.linkedin.com/in/bristoljon",
    },
  },
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: { name: "blog", path: `${__dirname}/content/blog` },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: { name: "projects", path: `${__dirname}/content/projects` },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: { name: "pages", path: `${__dirname}/content/pages` },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        // The legacy MySQL `content` columns are HTML, including the
        // <div class="tech"> / <div class="pain"> blocks that drive the
        // "technical detail" toggles. Remark passes raw HTML straight through.
        plugins: [],
      },
    },
    "gatsby-plugin-sitemap",
    "gatsby-plugin-netlify",
  ],
}
