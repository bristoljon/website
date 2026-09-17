---
title: "Update 2 - Week 4"
date: 2015-06-19
type: "Update"
number: 2
excerpt: Shadows, a contact form, scraping the router for who's home, dozenal fractions, and an experiment in automated 3D.
tags:
  - "JavaScript"
  - "AJAX"
  - "3D"
  - "Dozenal"
  - "Shadows"
  - "Router"
draft: false
comments: []
---

So last week I started out playing with shadows in [Shader](/projects/shader/). Possibly inspired by the nice weather. This was kind of a proof of concept which I then applied to my dozenal calculator in ['SunCalc'](/projects/suncalc/), where I also added the option to change shadow lengths depending on distance from the 'sun'. This planted the seed for the project that I finished the week with..

Next, I added a [contact form](/#contact) to my website which used the PHP I'd learned on my course and played around with in [Spoofer](/projects/spoof/). I also experimented with $_SERVER variables so that the e-mail form attaches the sender IP address to their message - bit big brother I know but it's interesting to know it's that easy!

I continued the big brother theme with my next mini-project where I made a simple website for my internal web server that scrapes the MAC addresses from the router's welcome page and compares them to a list in a database to give a list of the people who are home. As it's just me and Roland (the cat) at the moment I assigned him the printers URL so he shows up as well. Occurred to me I could make him a wifi collar so it would be accurate but that is a low-priority project for another day!

I finished that but decided I wanted it to update the list using something called AJAX, essentially this allows you to update content on a page without reloading the whole thing. So I got that working nicely and then I had to go back to my e-mail form and apply the same method there too. Before it used to reload the page when you hit 'send', now no.. Small things!

<div class="tech">

Next I went back to [my dozenal calculator](/dozenal/) to fix a few bugs like preventing double pressing of operator keys etc. And to have another go at getting fractions working. The problem is Javascript only has methods to convert decimal fractions to dozenal fractions but not vice versa so the only solution is a custom function. Using my GCSE maths and [this](http://www.dozenal.org/articles/DSA-ConversionRules.pdf) I thought I'd cracked it but turned out it wasn't consistent. In frustration I turned to the internet and found [this](http://flud.org/dozenal-calc.html) inexplicably on a completely unrelated site. I straight up stole the functions and plugged them into my calc and it works well. So thanks to flud.org it's pretty much finished.. For now.

</div>

Finally on Friday I started working on what I'd been thinking about all week - 3D! I knew that I could make two subtly different versions of a web page to create a 3D effect but I wondered if it would be possible to automate this. A quick google showed that it was possible to add additional styling to individual iframes (sort of a website within a website) so I set to work. The [3D Viewer](/3d2/) basically adjusts the positions of all the elements in each iframe based on height and depth tags that I added to the source html. What was most satisfying about this little experiment is the code.. It's surprisingly short and has a 3 layer nested for-loop that I properly geeked the fuck out on.

So all in all a pretty good week. This week I'm focusing on one or two of my website ideas, probably 'mystery party'/'who the fuck is that?'.. More on that later.
