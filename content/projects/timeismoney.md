---
title: "Time is Money"
date: 2015-09-03
excerpt: A counter that reframes your working hours as money earned, and money as the hours it costs you.
status: Archived
tags:
  - "JavaScript"
  - "JQuery"
  - "Responsive"
  - "Angular"
  - "Bootstrap"
  - "Tabs"
  - "OnePage"
  - "Money"
  - "Time"
  - "Conversion"
  - "Abstract"
links:
  - label: "Live app"
    url: "/projects/units"
  - label: "Source"
    url: "https://github.com/bristoljon/bristoljon.uk/tree/master/projects/units"
draft: false
comments: []
---

This came from something I wanted to make whilst working as an agency paramedic, cashing in before switching careers. I was doing a lot of clock watching and thought it would be nice to have a counter so that I could view time as money earned and watch the pennies add up as the seconds roll by. Anyway, I still haven't gotten round to implementing that part yet but got the basic unit converter up now.

## How to use it

-   Enter your details in first tab
-   Check your 'stats'
-   Add your own units (or remove existing ones)
-   Use 'Convert' tab to see how much a wank costs you..

## Technical details

I originally started this using JavaScript and jQuery but recently learnt enough Angular to realise it would be more suitable for that. Angular binds the model (data) and the view together for you so that it's really quick and easy to tie inputs to variables. This app will have a lot of inputs and outputs so it's ideal for coding with Angular. So far I've used Bootstrap's tabs component to make a single page application although I might switch that over to angular routing system as the HTML is getting pretty hectic and it would be nice to keep it modularised. I've also tried to use more object-oriented code instead of my normal procedural style and starting to see the benefits of that.

So far, when the user enters their age, hours and pay; Angular clocks the change and fires off a couple of functions that calculate things like hourly pay and workYearsRemaining and updates the few paragraphs in 'Stats' tab. The default units are coded in as objects within time and money arrays. The code to allow users to add their own units was minimal. As was the code to sort results by name and units.

## To do

-   **Counters** - want to add counters so you can see how much you've earned since a set start time and also countdown functionality towards a certain unit goal like a holiday or new car
-   **Custom input units** - add unit add on to work amount and pay amount inputs so you can enter daily hours or pay instead of just weekly hours and yearly salary
