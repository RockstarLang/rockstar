---
title: Deep Cuts
layout: docs
examples: /examples/12-deep-cuts/
nav_order: "1011"
summary: The deep cuts. The murky corners of Rockstar that even Rockstar fans don't know about.
---
Rockstar's a fun language but once in a while you might stumble across a weird bug -- and yes, it's probably a bug, but here's some tips that might help you figure out what's going on so you can report it and/or work around it.
## @dump

The `@dump` statement will print the entire current state of your program's memory to STDOUT, along with `object id` numbers which will show you whether two different variable or references are actually pointing to the same underlying value or not:

{% rockstar_include dump-arrays.rock %}
