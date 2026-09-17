---
title: "iMedic - Paramedic App"
date: 2010-07-14
excerpt: An iOS app written in Objective-C for paramedics — assessment tools and drug calculations.
status: Archived
tags:
  - "PHP"
  - "Mobile"
  - "iOS"
  - "App"
  - "Full-stack"
  - "Paramedic"
links: []
draft: false
comments: []
---

I first started working on iMedic when I was finishing my paramedic training a few years ago. At the time there was only one app that contained the JRCALC clinical guidelines (that every paramedic is supposed to carry). This app was a slow and ugly, html based mostrosity but it provided the guidelines in a digital format and people were paying the (at one point) £14.99 asking price. So I thought I could do better and started learning objective-C/iPhone development.

I started out with the simplest feature, the [touchtimer](/taptimer) that I thought might be useful for quickly estimating respiration rates; but I actually used it on the road for estimating heart rates in infants (as I found it easier to tap out the beat whilst listening through a stethoscope than trying to count at 160+ BPM!). I added a few other tools before hitting a wall with the database back-end needed for the hospital details. Unfortunately at this point, I had just registered as a paramedic and begun working full-time shifts so the projects stalled as I failed to find the time to continue working on it.

Despite the long delay progressing this project, there does still seem to be a gap in the market for an integrated paramedic app with all the features I originally wanted to include. The only problem is now the latest guidelines are published by a different company that seems to be unwilling to license them to 3rd parties.

## Technical details

My original design was for iPhone so it was tab-based with the following 5 tab's:

-   **Reference** - Trust-specific clinical updates and alerts, JRCALC guidelines (user-friendly, searchable interface), Quick reference guides for emergency procedures such as EZ-IO, Needle-Cricothyroidotomy, etc. Any other user suggested references..
-   **Paediatric / Age-per-page** - Normal values, emergency drug dosages etc
-   **Hospitals** - User downloaded database of local hospitals/units including opening hours, acception criteria, directions etc.
-   **Tools** - Mixed bag of useful tools and calculators for everyday/job tasks like:
    -   GCS Calulator - Simple 3 x Slider bars with total at top and paediatric mode
    -   [BPM counter](/taptimer) - Quick breathing or heart rate estimator
    -   [Alcohol Unit Calculator](drinkscalc) - Literally!
    -   Cardiac Arrest tool - touch events to log drug, tube times etc possibly a metronome and drug reminders
    -   APGAR scores - Similar to GCS calculator
    -   Obstetric Dates Calulator - aka 'Knocked App', get POG, LMP or due date from any known date
    -   Age from DOB - And vice versa because you know, better to have it and not need it than..
    -   ...Any other user suggested ideas.
-   **Log** - Personal job/skills log for recording skills or drugs used for CPD. And/or recording interesting jobs. Password protected.

The hospital and trust-specific clinical updates would have to be hosted by each trust on a password protected server so the user would enter the URL and credentials for their specific trust and the app would download all the relevant data. If the user doesn't have a trust specific repository to use, the app could scrape basic location and opening hour info from the NHS choices website.
