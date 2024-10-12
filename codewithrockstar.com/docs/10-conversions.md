---
title: Conversions and Mutations
layout: docs
examples: /examples/10-conversions/
nav_order: "1009"
summary: "Every great entourage has a fixer: the person who sorts out those last few bits that weren't really anybody else's job. Conversions and mutations are Rockstar's fixers: if you need to parse strings into numbers, convert character codes, we got you."
---
### Conversions and Mutations

Most of Rockstar's built-in operations can either act in place, modifying the variable passed to them, or leave the result in a target variable and leave the source unmodified:

* `Modify X` - acts in-place
* `Modify X into Y` - leave `X` intact, store the result into `Y`
* `Modify X with Z` - act in place, using optional parameter `Z`
* `Modify X into Y with Z` - modify `X` using `Z`, store the result in `y`

### Splitting Strings

To split a string in Rockstar, use the `cut` mutation, or aliases `split` and `shatter`.  

{% rockstar_include split-strings.rock %}


### Joining Arrays

To join an array in Rockstar, use the `join` mutation, or the aliases `unite` or `gather`:

{% rockstar_include join-arrays.rock %}

### Type Conversions

To convert any value to a string, add it to the empty string.

{% rockstar_include join-arrays.rock %}

The built-in `cast` function (aka `burn`) will parse strings into numbers, or convert a number into a Unicode character corresponding to the number's code point.

{% rockstar_include cast.rock %}

#### Arithmetic Rounding

Rounding in Rockstar is performed by the `turn` keyword. `Turn up` will round up (i.e. towards positive infinity), to the nearest integer; `turn down` will round down (towards negative infinity) to the nearest integer, and `turn round` will round to the nearest integer. Bonnie Tyler enthusiasts will be pleased to note that Rockstar accepts `turn around` as a valid alias.

Turn operations act in-place: they modify the variable directly, and will return the rounded value.

```
X is 1.2
Turn up X
Shout X (will print 2)

X is 1.2
Turn down X
Shout X (will print 1)

The radio's playing. The night has just begun.
 (initialises the radio with 7.35345)
Turn up the radio
Say the radio (will print 8)
```

Rounding supports variable [pronouns](https://docs.codewithrockstar.com/docs#pronouns), so you can write phrases like:

```
My heart is on fire. Aflame with desire.
Turn it up.
Shout it.
```

which will print the value 25 (obviously).
