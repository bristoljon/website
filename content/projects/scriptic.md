---
title: Scriptic
date: 2020-01-27
excerpt: A social platform for creating, playing and hosting clue trails over
  SMS. Treasure hunts, quizzes and riddles, played by text message.
status: MVP
tags:
  - React
  - Serverless
  - Netlify
  - GraphQL
  - Apollo
  - FaunaDB
  - Twilio
  - SMS
  - Stripe
  - Google Maps
links: []
updates:
  - date: 2020-01-27
    type: new
    title: Clue trails by text message
    body: A platform for writing clue trails that anyone can play from their phone by SMS, with no app to install.
draft: false
---

A clue trail you play by text message. Someone writes a script: a series of steps, each a clue, riddle or question with the answer that unlocks the next. Players find trails near them on a map, start one, and the game runs over SMS. Scriptic texts each clue, checks the replies, and moves them on when they get it right.

Anyone can write a trail and keep it private, share it, or sell it. Hosts can run a game for a group, and follow along as players make their way round.

## Where it's at

The MVP was live at scriptic.io, with trail search, the script editor, hosting and payments all working. Texts cost money to send, so it's pay per use: players top up credit, and authors can charge for their trails.

<div class="tech">

## Technical details

- **Front end:** React with Material UI, Apollo Client for data, and Google Maps for finding trails nearby. Scripts are built step by step in a drag-and-drop editor.
- **Back end:** Netlify Functions. `receive-sms` is the Twilio webhook that runs the games: it matches each incoming text to a game, checks the answer and sends the next step. Other functions handle auth, starting and stopping games, trail search and payments.
- **Data:** FaunaDB, through its generated GraphQL API, with access rules so a trail's answers only ever reach its author. Trails are indexed by S2 geohash for searching by location.
- **Auth:** short-lived JWTs, with refresh tokens in http-only cookies and magic-link sign up.
- **Payments:** Stripe, for topping up credit and buying trails.

</div>
