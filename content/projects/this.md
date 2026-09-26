---
title: "bristoljon.uk"
date: 2015-08-05
excerpt: The site you're reading. Now a static build rather than PHP and MySQL.
status: Archived
tags:
  - "PHP"
  - "JavaScript"
  - "AJAX"
  - "iOS"
  - "JQuery"
  - "App"
  - "GPS"
  - "Location"
  - "Games"
  - "Social"
  - "Stereoscopic"
  - "CSS"
  - "Parallax"
  - "Web"
  - "HTML"
  - "MySQL"
  - "Responsive"
  - "AngularJS"
  - "CMS"
images:
  - image: /img/projects/this.jpg
    caption: "The rebuilt site, 2026"
  - image: /img/projects/this-2016.jpg
    caption: "The old PHP site, showing the iMedic project page"
links:
  - label: Source
    url: https://github.com/bristoljon/bristoljon.uk
draft: false
comments: []
updates:
  - date: 2026-09-26
    title: "A long overdue rebuild"
    body: |-
      Eleven years on, the site has finally been rebuilt. It's off PHP and MySQL and is now a static Gatsby site on Netlify, with the posts and projects kept as markdown and edited through Decap CMS.

      Also included a new look (with a dark mode), a [CV](/cv) page with print to PDF (which is something I've wanted forever), and rescuing the old project updates from the old site's feed so they show here and on the homepage again. Thanks Claude ;-)
  - date: 2015-08-21
    title: "Added images"
    body: "Finally got round to adding images. True to form, I couldn't do it the easy way and opted for a custom PHP script and HTML form that uploads images to the server and adds details such as description and url to a table in the database. Then it associates the image record with a particular project. This means I can link multiple projects or blogs to one image. To display them I use AJAX to grab the matching image URL's from the db and display them as thumbnails in the image panel. Will start adding more images soon."
  - date: 2015-08-15
    approxDate: true
    title: "Recent Updates Feed"
    body: "Added a 'recent updates' feed for the home page that generates this little panel that you are reading this in. I added a 'updates' table to my database, any changes I make generate an entry there and this page uses AJAX to collect the most recent ones and display them here."
---

The idea is to create a website to keep track of all my project ideas and also to practice my developing developing skills (see what I did there!)

## Technical details

To be continued...
