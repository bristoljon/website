---
title: Corner Mic Locator
date: 2016-09-01
excerpt: Pinpoints where sounds are in a room from the tiny differences in when
  they reach a microphone in each corner. Runs in the browser, with a simulated
  room to try it without the hardware.
status: Proof of concept
tags:
  - JavaScript
  - Web Audio
  - Signal processing
  - Acoustics
  - Canvas
  - Maths
images:
  - image: /img/projects/locator.jpg
    caption: Three simulated sources, two talking and one clapping, each located
      to within a centimetre
links:
  - label: Live app
    url: /projects/locator/
updates:
  - date: 2026-09-18
    title: A working prototype, ten years on
    body: The locator finally exists. It runs a simulated room in the browser
      and picks out two or three talkers at once, and it's ready for live
      microphones once the hardware arrives. [Try it](/projects/locator/).
  - date: 2016-09-01
    type: new
    approxDate: true
    title: The idea
    body: Put a microphone in each corner of a room and work out where a sound
      came from by when it reaches each one.
draft: false
---

Put a microphone in each corner of a room. When someone speaks, the sound reaches the nearest mic first and the others a few milliseconds later. Sound travels about 34 cm per millisecond, so those tiny differences are enough to work out where the speaker is standing. The idea came up about ten years ago and sat in the back of my head until now.

The [live app](/projects/locator/) shows a floor plan of the room with a heat map of where sounds are likely coming from, a dot for each one it's tracking, and the timing difference measured between every pair of mics.

## How to use it

It opens in **Simulator** mode, a virtual 5 × 4 m room with a mic in each corner and up to three sound sources.

-   Drag the sources A, B and C around the plan and watch the located dots follow them.
-   Change what each source plays: speech, claps, broadband noise or a steady hum.
-   Turn up the wall reflections and mic noise to see where it starts to struggle.
-   Tick "Source A walks around the room" to watch it track a moving talker.

**Live mics** uses a real audio interface. It needs four microphones plugged into one interface that the browser sees as a single four-channel device, with inputs 1 to 4 going clockwise from the top-left corner. Enter the room size and mic positions under Room and mic geometry.

## How it works

There's no way to know when a sound was made, only that one mic heard it a bit before another. So it works with differences.

Every 43 ms it takes a snippet from each pair of mics and slides one against the other to find the shift where they line up best. That shift is the delay for that pair. Four mics give six pairs, so six delays. Those are the spiky traces under the plan.

Then it splits the floor into 5 cm squares and asks of each one: if the sound came from here, what would the six delays be? A square where all six traces have a spike in the right place scores high. The heat map is that score, and the dots are the highest-scoring squares.

Two people talking give two spikes per trace and two hot spots on the map. A wrong pairing of spikes might fit one or two mic pairs, but never all six, which is how it avoids seeing people who aren't there.

## Where it's at

In the simulator it separates two or three talkers at once and places them to within a few centimetres, even with a fair bit of echo. That's a best case, because the simulated room matches the maths exactly. A real room adds furniture, longer echoes and mics that are only measured to the nearest centimetre or two, so I'm expecting more like 10 to 30 cm.

A steady hum can't be located at all. It repeats every cycle, so it lines up with itself at lots of different delays.

The hardware is next: a four-input audio interface and four measurement mics. After that, a clap-to-calibrate routine and support for eight mics.

<div class="tech">

## Technical details

-   **Timing:** GCC-PHAT. Both snippets go through an FFT, the cross-spectrum is whitened so every frequency counts equally, and an inverse FFT gives a correlation with a sharp spike at the delay. Only 250 Hz to 6 kHz is used. At 48 kHz one sample is about 7 mm of path difference.
-   **Locating:** SRP-PHAT. Each grid square's expected delays are worked out once from the mic positions and the speed of sound, which is set from the room temperature. Each frame sums the six correlations at those delays. The best square is refined on a finer grid down to 5 mm.
-   **More than one source:** after finding the strongest source, it blanks out that source's spike in each correlation and searches again.
-   **Tracking:** each dot is matched to the nearest detection within 60 cm, smoothed, and only shown after four hits in a row, so one-off echoes don't flash up.
-   **Simulator:** each source is synthesised and delayed to every mic by distance over the speed of sound, with first- and second-order wall reflections, a diffuse echo tail and separate noise on each mic. The locator only sees the four mic signals.
-   **Live input:** `getUserMedia` with echo cancellation, noise suppression and auto gain turned off, since those mix the channels down. The mics must all run off one clock. Separate USB mics each keep their own time and drift, which throws the delays out by far more than the differences being measured.
-   **Speed:** about 4 to 7 ms of work per 43 ms frame, in plain JavaScript with no libraries.

</div>
