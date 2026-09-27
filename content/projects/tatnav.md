---
title: TatNav
date: 2026-09-20
excerpt: Zero hassle free shit. Point your phone at something left out on the
  street and it goes on a map for anyone nearby. No login, no typing, no forms.
status: Active
images:
  - image: /img/projects/tatnav-home.jpg
    caption: "The home page: post something, or see what's nearby"
  - image: /img/projects/tatnav.png
    caption: Zero hassle free stuff
tags:
  - PWA
  - AI
  - Gemini
  - Vision
  - Maps
  - Leaflet
  - Netlify
  - Postgres
  - Location
links:
  - label: Live app
    url: https://tatnav.net
draft: false
---
Plenty of perfectly good stuff gets left out on the street for anyone to take, and plenty of people would take it if they knew it was there. Listing sites want an account, a description and a conversation. TatNav wants one photo.

Point your phone at a chair, a lamp or a pile of boxes and tap. An AI model looks at the photo and describes what's there, splitting a pile into separate items. You check it and post it, and it's a pin on the map for anyone nearby. Whoever picks something up marks it taken, item by item, and it drops off the map.

Similar to[ "Speedy"](https://bristoljon.uk/project/speedy) the app is all about minimal time to fun and least taps, no registration, no typing, just snap, confirm, done :-) 

## How it works

* **Post something:** take a photo. The description and your location fill in while you watch, so you're only ever confirming, not typing.
* **See what's nearby:** browse the map, search for a settee or a lamp, or get told when something turns up near you.

<div class="tech">

## Technical details

The whole thing rested on one assumption: that a cheap vision model could look at a kerbside photo and describe it well enough that you'd just tap "confirm". So before writing any app code I ran thirty real photos through it and read the results. Splitting a pile into separate items worked, which was the biggest risk. It costs about $0.0007 a scan and takes 2 to 3.5 seconds. Those photos, with corrections, are now the permanent eval set for prompt changes.

Three seconds is a long time holding a phone up at a kerb, so the app never makes you wait for it. The photo goes on the confirm screen the moment you tap, and the model call and the GPS fix run at the same time and fill in separately.

* **Front end:** a Vite PWA using the phone's camera through `getUserMedia`, downscaling each photo to 768 px before upload.
* **Back end:** Netlify Functions. The scan function holds the API key, rate-limits and calls Gemini Flash-Lite. The prompt never mentions JSON; the response shape comes from a schema passed alongside it.
* **Storage:** photos in Netlify Blobs, listings and items in Netlify DB (Postgres), written in one transaction. PostGIS wasn't available, so "near me" is a bounding-box query.
* **Map:** Leaflet with clustered pins.

</div>
