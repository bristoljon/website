---
title: Speedy
date: 2026-06-21
excerpt: Crowdsourced average speed cameras. Phones along a road read number
  plates on-device, and when two of them see the same car, Speedy works out how
  fast it went between them.
status: MVP
images:
  - image: /img/projects/speedy.jpg
    caption: The matches map and the live camera, flashing 41 mph
  - image: /img/projects/speedy-camera.webp
    caption: Live camera, reading plates as they pass
  - image: /img/projects/speedy-flash.webp
    caption: "A match: speed flashed over the car"
  - image: /img/projects/speedy-matches.webp
    caption: Matches, with both capture points on a map
  - image: /img/projects/speedy-nearby.webp
    caption: Other phones nearby
tags:
  - React Native
  - iOS
  - Android
  - OCR
  - AWS
  - CDK
  - WebSocket
  - WebRTC
  - Leaflet
  - TypeScript
links:
  - label: Website
    url: https://d20tra4i0hvi3z.cloudfront.net/
  - label: iPhone beta
    url: https://testflight.apple.com/join/peCUGzxA
  - label: Android beta
    url: https://play.google.com/apps/internaltest/4701417886656338036
updates:
  - date: 2026-09-25
    title: iPhone and Android betas open
    body: Speedy is on TestFlight and Google Play internal testing. Links on the
      website.
  - date: 2026-06-21
    type: new
    title: Average speed checks from two phones
    body: Prop up a phone at each end of a stretch of road, read number plates on the phone, and when both see the same car, flash its average speed.
draft: false
---

An average speed camera anyone can set up. Prop a phone up facing a road, get a mate to do the same further along it, and Speedy reads the number plates going past. When both phones see the same car it works out the road distance between them and how long the car took, and flashes the average speed.

The server only relays plate captures between nearby phones and forgets them after an hour. Match reports and photos stay on the phones. The one thing kept long term is a plate-free heat map of average speeds on each stretch of road, which is on the website.

## How it works

1. **Capture.** The camera runs OCR on the live picture, on the phone. A plate has to be read on a couple of frames before it counts, which cuts out most misreads.
2. **Broadcast.** Each capture (plate, GPS position, time) is saved on the phone and sent to other Speedy phones within about 5 miles.
3. **Match.** When your phone sees a plate that another phone reported in the last hour, the two captures are paired.
4. **Speed.** The road distance between the two points comes from a routing API, not a straight line, and speed is distance over time.

<div class="tech">

## Technical details

A monorepo with three parts:

- **Mobile:** a bare React Native app for iOS and Android. VisionCamera frame processors run on-device OCR; region-specific validators decide what's a real UK plate. A streak check needs the same plate on N OCR samples (tolerating a few skipped frames) before it's captured, and similar misreads like `AB12CDM` / `AB12CDW` are merged into one streak. Captures and speed results go in SQLite, photos on the filesystem. An Android foreground service keeps capturing in the background.
- **Infra:** an AWS CDK stack. An API Gateway WebSocket API relays captures and presence between nearby phones through a DynamoDB buffer with a one-hour TTL. `POST /distance` gets road distances from Amazon Location Service (HERE routing), cached for 30 days.
- **Web:** a Vite and React site with the beta links, the privacy policy and a Leaflet heat map of segment speeds.

Photos for a speed report go straight between the two phones over WebRTC, using the WebSocket only for signalling, so they never touch the server.

</div>
