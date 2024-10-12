---
title: Types and Values
layout: docs
nav_order: "1002"
summary: "Meet Rockstar's type systems: numbers, strings, booleans, null, and mysterious."
---
## Types

Rockstar uses a similar type system to that defined by the [ECMAScript type system](http://www.ecma-international.org/ecma-262/5.1/#sec-8), except `undefined` doesn’t sound very rock’n’roll so we use `mysterious` instead.

* **Number** - Numbers in Rockstar are fixed-precision , stored according to the [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) standard. _(An earlier version of this spec proposed that Rockstar used the [DEC64](http://www.dec64.com/) numeric type. This is a perfect example of something that seemed like a great idea after a couple of beers but turns out to be prohibitively difficult to implement…)_
* **Boolean** - a logical entity having two values `true` and `false`.
	- `right`, `yes` and `ok` are valid aliases for `true`
	- `wrong`, `no` and `lies` are valid aliases for `false`
- **Function** - used for functions.
- **Null** - the null type. Evaluates as equal to zero and equal to false. The keywords `nothing`, `nowhere`, `nobody`, and `gone` are defined as aliases for `null`
- **Mysterious** - the value of any variable that hasn’t been assigned a value, denoted by the keyword `mysterious`.

## Strings

Rockstar strings are surrounded by double quotes. A string literal includes everything up to the closing quote, including newlines. To include a double quote in a string, use a pair of double quotes. Rockstar strings are stored internally as UTF-16, and support the full Unicode character set.

The keywords `empty`, `silent`, and `silence` are aliases for the empty string (`""`)

{% rockstar_include string-literals.rock %}
## Numbers

**Number literals** are written as ordinary digits; decimals and negative numbers are supported:

{% rockstar_include number-literals.rock %}

A Rockstar number is a 128-bit fixed-precision decimal, between -79,228,162,514,264,337,593,543,950,335 and +79,228,162,514,264,337,593,543,950,335.

You get 29 digits, a minus sign if you need it, and a a decimal point you can put anywhere you like:

{% rockstar_include number-limits.rock %}

Numbers with more than 29 digits will be rounded to 29 digits if they have a decimal part:

{% rockstar_include number-29-digits.rock %}
## Booleans
Rockstar supports the Boolean literals `true` (aliases: `yes`, `ok`, `right`) and `false` (aliases: `no`, `wrong`, `lies`).
{% rockstar_include boolean-literals.rock %}
## Null

Rockstar `null` represents an expression which has no meaningful value. Aliases for `null` are `nothing`, `nowhere`, `nobody` and `gone`:

{% rockstar_include null-literals.rock %}