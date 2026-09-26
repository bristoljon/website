---
title: "Ember lantern"
date: 2026-09-18
excerpt: A rechargeable camping lantern where the dome is the only control. Twist it and the light sweeps from a dim deep red through candle amber to bright white; press it to switch on or off.
status: Active
tags:
  - "Hardware"
  - "ESP32"
  - "LEDs"
  - "3D printing"
  - "OpenSCAD"
  - "KiCad"
  - "PCB"
  - "Arduino"
  - "Camping"
images:
  - image: /img/projects/ember-section.png
    caption: "Section through v0.3: dome and control column as one printed part"
  - image: /img/projects/ember-ring.png
    caption: "The 24-LED ring board, routed"
  - image: /img/projects/ember-main.png
    caption: "The main board, placed but not yet routed"
links: []
draft: true
---

A camping lantern with one control. It's a puck about 9 cm across and 8 cm tall, with a translucent dome on top. Twist the dome and the light sweeps continuously from a barely-there deep red, through orange and candle amber, to warm white and finally a bright neutral white. Press it to switch on or off. It always comes back where you left it.

Right way up on a table it lights the whole dome. Flip it over and six magnets in the base stick it to a car roof, a tent pole or a steel shelf, with the LEDs shining straight down and nothing in the way. A cheap LED-strip remote works too, for when it's stuck somewhere you can't reach.

On one 18650 cell it should run about 3 hours at full brightness, 13 hours at amber, and for days as a red night light. It charges over USB-C.

## Where it's at

The design is at v0.3. The enclosure is down to two printed parts, a base and a dome, and the firmware is written. Next is a hand-wired prototype built from off-the-shelf modules, to settle the layout and tune the colours by eye through the dome. After that, two custom boards for a small run.

<div class="tech">

## Technical details

**One dial.** The rotary encoder under the dome is clamped to 60 detents, three full turns, and normalised to a single level from 0 to 1. Colour and brightness are both functions of that one number, which is what makes it feel like a dial rather than a menu. The colour comes from a table of keyframes, from pure red at 0 to white with a touch of blue at 1, interpolated between. Brightness follows a 2.2 gamma curve, so the bottom of the range spends lots of detents in the useful night-light zone. Hold the press for 1.5 seconds and it flickers like a candle.

**Light.** A 24-LED SK6812 RGBW ring lies flat on the base, facing up into the dome, with the encoder shaft through its middle. Warm tones come from adding red and a little green to the natural-white LEDs.

**The dome is the knob.** v0.3 prints the dome and the column that grips the encoder shaft as one part, in the same translucent PETG, so the column glows instead of casting a shadow. The only real shadow left is a 10 mm flare at the top, about 0.8% of the dome.

**Electronics.** An ESP32-C3 SuperMini, a TP4056 USB-C charger, a TPS61023 5 V boost converter and an HT7333 regulator, with a 74AHCT125 shifting the LED data up to 5 V. The LEDs draw about 1 mA each even when dark, so the ESP32 cuts the whole 5 V rail when it's off and deep-sleeps at around 10 µA, waking on the encoder button or the IR receiver.

**Boards.** For the small run, two PCBs replace the modules. KiCad drafts exist for both: a ring board with the 24 LEDs, fully routed, and a D-shaped main board with everything else, placed but not routed.

The case is modelled in OpenSCAD and the firmware is an Arduino sketch.

</div>
