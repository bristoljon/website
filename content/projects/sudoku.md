---
title: Sudoku Solver and Grader
date: 2016-03-24
excerpt: A free sudoku solver and difficulty grader. Scan a puzzle with your
  camera, watch it solved step by step, and see how hard it really is.
status: Production
images:
  - image: /img/projects/sudoku-2026.png
    caption: Version 2 (2026), ready to scan or solve a puzzle
  - image: /img/projects/sudoku.jpg
    caption: Version 1 (2016), with its search methods
  - image: /img/uploads/layer1_map.png
    caption: Rendering of the small layer-1 neural network weights used to drive the
      OCR for scanning
tags:
  - Sudoku
  - PWA
  - Computer vision
  - Neural network
  - JavaScript
  - OOP
  - Object Oriented
  - ES6
  - ECMA6
  - Solve
  - Puzzles
  - Proxies
  - Promises
  - Generators
links:
  - label: Live app
    url: https://sudoku.bristoljon.uk/
  - label: Source
    url: https://github.com/bristoljon/sudoku
  - label: Version 1 (2016)
    url: https://v1.sudoku.bristoljon.uk/
updates:
  - date: 2026-09-28
    title: Complete overhaul, now it actually grades puzzles
    body: >-
      Ten years on, it finally does what I set out to make it do. Grading works:
      it solves the puzzle five different ways, each copying a different human
      approach (box by box, digit by digit, rows then columns, an all-rounder
      and a pencil marker), and counts how much looking each one needs. That
      gives a rating from Gentle up to Diabolical, plus how much the puzzle
      favours one style over another.


      You can also scan puzzles in with your camera. Take a photo of one from a newspaper or a screenshot, and it finds the grid, straightens it and reads the digits using a small neural net, all on your phone. Anything it's unsure of gets flagged so you can check it before importing.


      It's mobile friendly now too, works offline and can be installed like a native app. [Try it here](https://sudoku.bristoljon.uk/). The original 2016 version is still up [here](https://v1.sudoku.bristoljon.uk/).
  - date: 2016-04-21
    title: Babelified to ES5 - Now works on Safari and older browsers
    body: Added some tooling to transpile the source into ES5 so that it works on
      desktop and mobile safari. Although desktop solve methods are really slow,
      seems to be to do with the regenerator runtime. Also had to remove my use
      of proxies as it turns out there is no ES5 equivalent.
  - date: 2016-04-07
    title: Solves Blank Grid
    body: Refactored the tree search algorithm so that it now solves an empty grid.
      Previously it just simulated blanks that had 2 options now it runs
      recursively over all options of all blanks until it solves or determines
      that the puzzle is unsolvable. Pretty sweet.
  - date: 2016-03-29
    title: Added visual feedback
    body: "Major upgrade: Added visualisation with adjustable speed setting (using
      generator functions and setInterval). Also improved mobile experience
      although still buggy on chrome. Added screenshots to the project page."
  - date: 2016-03-15
    title: Sudoku Solver
    body: Making the most of my time off by making a sudoku solver. Plan is to dumb
      it down and use it as a difficulty rater by comparing the effectiveness of
      different techniques. For now it just solves puzzles..
draft: false
---

**[Open the Sudoku Solver](https://sudoku.bristoljon.uk/)**

A free sudoku solver and difficulty grader. Scan a puzzle from a newspaper, book or screenshot, watch it solved one digit at a time using the same techniques people use, and find out how hard it really is. It works on your phone, works offline, and can be installed like a native app.

## How to use it

- **Scan** a puzzle: take or choose a photo, check the digits it read (anything it's unsure of is flagged in orange), then Import. Or type the digits in yourself, or pick one of the example puzzles.
- **Solve** it with the search buttons, one technique at a time or all at once. Each digit is coloured by the technique that found it, and the Working panel explains every step. Use ‹ and › to step backwards and forwards.
- **Grade** it to get a difficulty rating from Gentle up to Diabolical.
- **Save** a puzzle by name to come back to it later.

## How it grades a sudoku

Most sudoku ratings come from the hardest technique a puzzle needs. This one tries to measure how much work a person would actually do.

It solves the puzzle five times, each copying a different human approach: box by box, digit by digit, rows then columns, an all-rounder, and a pencil marker who keeps track of every square's options. Every approach counts its looks: reading a square, checking whether a digit fits, or rubbing out a pencil mark. When one gets stuck it borrows another technique, and only guesses when nothing else works.

The difficulty is the average of those efforts. A typical newspaper easy takes around 800 looks. Arto Inkala's "world's hardest sudoku" takes about 340,000. Any puzzle that can't be solved without guessing is rated at least Tough, because guessing is hard for people however quickly it pays off. It also tells you which approach a puzzle favours, since some suit one style far better than another.

## How the scanner works

Everything happens on your phone. Nothing is uploaded.

1. It finds the grid, the biggest square-ish shape with the right lines inside it, and fits its four edges.
2. It straightens the grid and cuts it into 81 cells, stripping out the leftover grid lines.
3. A small neural network, about 50 KB and trained on thousands of generated photos of puzzles, reads each cell as 1 to 9 or blank.
4. It fills in the most confident digits first, so rows, columns and boxes don't clash, and flags any it isn't sure of for you to check.

## Version 1 (2016)

Finally got round to starting this project. The idea is to emulate the various different approaches people take to solve the puzzle and then try all of them to determine the average time each takes to solve it (if at all). Seems that everyone has a different approach to the problem. Longer term I wonder whether it might be able to parse a solving algorithm from a free text description of an individuals method.

It's still up [here](https://v1.sudoku.bristoljon.uk/).

### How it worked

Enter digits in the grid; you can use arrow keys on keyboard or click / touch.

Hover over (or touch on mobile) any cell to view the digits it could be. This updates automatically whenever a cell changes.

Use 'Save' to store the current puzzle state so you can return to the beginning if you want.

Use a combination of different search methods to solve the puzzle. Or just click Solve.

Use 'Ultra' mode unless you want to wait all day! But 'Slow' is useful for working out what the different searches do.

Use the arrow keys to scroll backwards and forward digit by digit

-   **Not Search** - For every blank that has changed state, remove all the digits in that cells row, column and box from it's 'maybes' list. If only one remains, enter it.
-   **Not Check** - Additional method that checks all the affected cells whenever a value is entered to see if they can now be only one thing. Basically makes 'Not Search' redundant.
-   **Box Search** - For each box, create list of cells where each digit could go. If only one place, enter it. If only 2 places, and they are on the same row or column, update the rest of the group's maybes lists
-   **Line Check** - Additional check after box search, if digit can only be in 2 or 3 cells on the same row or column, then it can't be anywhere else on that line
-   **Column Search** - For each column, create list of cells where each digit could go. If only one place, enter it.
-   **Row Search** - For each row, create list of cells where each digit could go. If only one place, enter it.
-   **Solve** - Not, Box, Column and Row search until no blanks remain or maximum iterations reached. Now runs with visuals on thanks to async promises.
-   **Tree Search** - Triggered if 'Solve' fails, recursively tries all the possible values a cell could be and attempts to solve it. Can be used to solve a blanks grid.

### Technical details

So far, I've set about making sure the 'sudoku' object has the means to address individual rows, columns and boxes as well as individual cells. I then added a couple of methods that I use to solve it and tested them against a couple of different puzzles. It seems to work, or at least it gets as far as I do with those techniques.

I played around with using a proxy for visualisation and it kind of worked. I just added a function that highlighted the cell whenever that cell object's value was read or changed (get or set). Problem is the animation runs asynchronously but the puzzle solving methods run synchronously so it didn't look right. In the end I changed the solving methods to generator functions and iterate over them with setInterval.

### Known bugs (fixed in 2026)

Problem on Chrome on Android - for some reason they use the wrong keycodes on keyup event. Works fine on desktop chrome and mobile firefox.

Safari (iOS and desktop) - seems to be because they don't support the latest ES6 language features like Arrow functions. Will use Babel to transpile at some point.
