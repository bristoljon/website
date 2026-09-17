---
title: "2 Months Later"
date: 2015-08-03
type: "Geek Blog"
number: 3
excerpt: Member log-in, form validation hell, HTML modularisation with PHP, one-time pads, moving the blog into MySQL, tags and comments.
tags:
  - "PHP"
  - "JavaScript"
  - "Encryption"
  - "Cryptography"
  - "Modularisation"
  - "Authentication"
  - "Validation"
  - ".htaccess"
  - "Comments"
  - "Tags"
  - "Forms"
draft: false
comments:
  - id: "14"
    author: "Sam asiri"
    date: "2015-08-04"
    body: "I need to get my terminology up to speed to read this properly! You have gone into an amazing amount of detail! Nice work man"
  - id: "15"
    author: "Anonymous"
    date: "2015-08-04"
    body: "Yeh, I call it my geek blog!"
---

So it's been about a month since my last post and 2 months since I stopped paramedic(k)ing around and took up coding (or learning to code) full-time. I've been pretty busy, mainly working on this site, adding features like the technical detail buttons above and adding member log-in. I've also been to Spain, moved in with my girlfriend and 'ushered' in a new era at my mates wedding on Saturday so not just been geeking out!

The technical detail buttons above are an experimental feature. Added them because when I was writing earlier blogs I wanted to go into more detail but didn't want to overload the reader so will see how this works out. Will make writing these things more of a challenge but that's cool. For those interested, I'm just adding "tech" and "pain" classes to relevant sections and the buttons simply toggle their visibility. It might also mean the 'Geek Blogs' are pretty short for non-tech readers but what do you expect.

One of the main changes I've made to the site is the log-in feature. I added this so I can add my more top-secret (i.e. potentially marketable) ideas to the site to share and collaborate with friends; and also to practice an essential web dev skill.

<div class="tech">

The actual log-in and out process is fairly simple. The authentication is handled by PHP/MySQL, basically the username and password is joined together, MD5 hashed and compared to values stored in the database - if they match a $_SESSION variable is assigned. If this var is present when the index (or any other page) is requested, PHP adds the username and 'logout' dropdown to the navbar; if it's not it adds the 'Login' dropdown. The 'logout' button is just a link to bristoljon.uk?logout=1 (disguised by .htaccess), when the GET variable is present, PHP unsets the $_SESSION var and destroys the session. What was more of a challenge was the validation on the 'Sign-Up' form..

</div>

<div class="pain">

Form validation is the process of ensuring that what a user enters into a form is valid. This is done both by JavaScript on the client side and then PHP on the server side (in case JS is disabled or fails) before the details are entered into the database. It took me a full day to get the form validating just how I wanted it, with feedback provided after each change! Essentially, any keypress fires the validate function for that field which updates the glyphicon and feedback text. Then the 'validateAll' function checks whether all fields are now valid and changes the submit button status accordingly. The only special case is the username input which first checks the username is valid and then uses AJAX to asynchronously check whether the name entered is present in the db by POSTing it to a simple PHP script that returns either 'available' or 'not'. Learnt a lot but would be lying if I said I didn't nearly lose my shit a few times! Especially when I hit the 'regular expressions' part - Fucking nightmare!

</div>

<div class="tech">

I moved on from this and found an interesting article about HTML modularisation using PHP which I applied to my site to make everything more manageable. The problem was I was having to rewrite changes to the navigation bar in all my html files individually. This is easily solved by moving all of my nav bar html including the sign-up modal to a separate 'header.html' file which I then include at the relevant point in all my files. Using this little nugget to ensure the file path is always correct: `$root = $_SERVER['DOCUMENT_ROOT'];` So now any changes I want to make to my nav bar only have to be made to a single file. I later applied this same technique to the e-mail contact form and comments feature that I added later on. I also carried on my housekeeping efforts and modularised my javascript and css so that reusable sections like sign up validation and e-mail (AJAX) scripts are in separate files which are included in the 'head.html' which in turn is included in all my pages. So now any plugins or libraries just have to be included there in order to be available on all my pages.

</div>

After this I took a break with a new project: [One Time Pad Encryption](/project/onetimepad). This is another little web app that I'd wanted to make for a while and now have the great satisfaction of being able to make! I read about one-time-pads in [2600 magazine](http://www.2600.com/) (incidentally, a fantastic quarterly available on kindle!). Technically one-time-pad encryption is unbreakable since encrypted text can decrypt to anything given the right key; yet it's really simple. So that was a fun little project. I later added the decrypt mode so that you can easily try different keys to try to decrypt a cipher with an unknown key (useful for riddles etc. as you can nest layers of encryption). Tech details are on that page.

Next I went back to this site and started putting my blog content (all 2 pages of it) into my database. Basically, up until then, each of those blog posts was a separate page; now the blog page you see is actually one template page that takes its content from the database. This means I can easily change the look of my blog. This is where I first started playing with .htaccess in order to disguise the ugly URL's needed to access individual blogs (this page is actually at bristoljon.uk/blog/index.php?blog=update-3). Once I had that basically working I decided to do the same for my projects; the idea is to have a consistent 'landing page' for each idea or project with all the info and links to the web app or site itself. So that's what you see when you click on some of my projects in the menu above (the rest will get their own pages soon).

<div class="tech">

This led me on to the tags panel you see on both the blog and project pages. The idea is to add tags to make searching for particular topics easy although it's not really needed now. It is achieved by an AJAX call to a simple PHP script that returns a JSON encoded array of all the tags linked to that particular blog or project. It was actually way more complicated than I expected since the MySQL query uses a JOIN to get the tag details from an association (blog_tag) table. So I learned a lot from that exercise.

</div>

<div class="pain">

Finally, I decided to add a simple comments feature to my blog and project pages which you can test out if you want. I even allowed anonymous commenting if you're not logged in. When 'submit' is clicked the comment is submitted to a PHP script (via good old AJAX) along with the user_id if they're logged in. The comment is entered into the comment table and the script returns the name of the user (which is then used in another ajax to my e-mail script so that I get a notification). I had some trouble working out how to allow users to delete their messages. The solution I came up with is that when comments are downloaded (using another AJAX call to the same script), the 'success' function adds a trashcan link to the header if the commenter_id matches the logged in user. If not, the script just puts a generic message icon. Also the comment id number is entered into the href attribute of the link. When the user clicks the trash icon, another ajax call POSTs the comment id stored in the href to the PHP script with a 'delete' var and the script deletes that post. Sure there is a more elegant way of storing the comment ID's than in the href attribute.. Let me know if you know it! Anyway I solved it in a round about way, so commenting works now.

</div>

Plan for this week is to update my CV, and start looking for jobs! At least now the site is sort of up together I can refer people here. But I'm not doing anything until I've had my poached eggs, fucking starving!
