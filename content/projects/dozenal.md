---
title: Dozenal Calculator
date: 2015-07-30
excerpt: A base-12 calculator, including fraction conversion.
status: Archived
images:
  - image: /img/projects/dozenal.jpg
    caption: "Version 2 (2026): 1/5 with the recurring digits overlined"
  - image: /img/projects/dozenal-v1.png
    caption: Version 1 (2015)
  - image: /img/projects/dozenal-v1-page.jpg
    caption: The original version 1 page
tags:
  - JavaScript
  - JQuery
  - App
  - Maths
  - Numbers
  - Dozenal
  - CSS
links:
  - label: Live app
    url: /projects/dozenal/
  - label: Source
    url: https://github.com/bristoljon/doz_tdd
updates:
  - date: 2026-09-25
    title: Recurring fractions fixed, at last
    body: >-
      Finally fixed the bug I found back in 2015, where 1/5 in dozenal came out
      wrong.


      The calculator now does exact fraction arithmetic, keeping every value as a whole-number numerator and denominator instead of a rounded decimal. Nothing gets rounded along the way, so recurring digits can be shown properly, with a line over the part that repeats. 1/5 in dozenal is 0.2497, with the 2497 recurring. Switching between dozenal and decimal is lossless now too, and dividing by zero now shows an error.


      You can also install it like a native app [Try it here](/projects/dozenal/).
  - date: 2021-12-08
    title: Finally working on v2 now 🎉
    body: I finally dusted off the Dozenal Calculator code as it seems to be getting
      quite a bit of traffic.. Have basically rewritten it using React and
      bignumber.js which should provide much better accuracy especially with
      fractions. Check it out [here](https://dozenal.netlify.app/)
  - date: 2015-08-06
    approxDate: true
    title: Bug Found
    body: 1/5 (dozenal) = 0;2 - Pretty sure this is related to the accuracy issue I
      mentioned before. When converting from doz to dec or vice versa, the
      output only shows as many decimal or dozenal places as the input. Should
      be pretty easy fix but won't be till after next week.
  - date: 2015-08-01
    approxDate: true
    title: Colours
    body: Changed colour for dozenal mode so that ';' key is consistent as well.
      Still don't really like the whole colour scheme but it'll do for now.
draft: false
---
Dozenal maths is base 12, unlike decimal base 10 so there are 2 extra digits (in this case a+b). For more info and all the reasons why it could be considered superior, look [here](http://www.dozenalsociety.org.uk/) and [here](http://www.dozenal.org/drupal/). I made this for some practice and because I always wanted a quick way to convert between the different number systems.

I had it working for whole numbers fairly quickly but fractions proved to be a nightmare as Javascript only has a function for converting decimal fractions into dozenal strings but not vice versa. I spent ages writing my own function to do the job before I hit google and found [this](http://flud.org/dozenal-calc.html) little gem! So thanks to flud.org for your beautiful functions (sorry I took without consent I couldn't find any contact email).

## How to use it

Should work pretty much like a normal calculator but with the addition of 'dec' and 'el' numbers. The DOZ button shows the current mode the calculator is in and you can change modes at any time (even with an unfinished equation on the display). Fractions only output to the same number of decimal (or dozenal) places as the input so if you want more precise output just add zeros. There are definitely still bugs in it but the maths seems to be correct (again thanks to Flud.org).

Also you can change the XL characters to any other letter (or symbol) by simply typing them in or long press on mobile. Just be careful what you choose. Any operator symbols will definitely cause weird errors and you might break the internet..

For best results on mobile hit install and it feels like a native app without the bloat (and ball ache for me)

Any questions, bug reports or feature requests, just send me a message. It is definitely still a work in progress! Enjoy.

## Known bugs

~~1/5 (dozenal) = 0;2 - Pretty sure this is related to the accuracy issue I mentioned before. When converting from doz to dec or vice versa, the output only shows as many decimal or dozenal places as the input. Should be pretty easy fix but won't be till after next week.~~
