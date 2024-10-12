---
title: Variables
layout: docs
nav_order: "1002"
summary: Ever wished you could create a variable with a space in it? Welcome to Rockstar, friend. We got you.
---
Rockstar variables are dynamically typed. There are three different ways to assign a variable in Rockstar.

1. `<variable> is <expression>`.  Valid aliases for `is` are `are`, `am`, `was`, `were`, and the contractions `'s` and `'re`
2. `put <expression> into <variable>`
3. `let <variable> be <expression>`

{% rockstar_include assignment.rock %}

Rockstar variables are function scoped - see variable scope in the section on functions for more about how this work.
# Variable names in Rockstar

Rockstar supports three different kinds of variable names.

**Simple variables** can be any valid identifier that isn't a reserved keyword. A simple variable name must contain only letters, and cannot contain spaces. Note that Rockstar does not allow numbers or underscores in variable names - remember the golden rule of Rockstar syntax: if you can’t sing it, you can’t have it. Simple variables are case-insensitive.

{% rockstar_include simple-variables.rock %}

**Common variables** consist of one of the keywords `a`, `an`, `the`, `my`, `your` or `our` followed by whitespace and an identifier. The keyword is part of the variable name, so `a boy` is a different variable from `the boy`. Common variables are case-insensitive.

> Common variables can include language keywords, so you can have variables called `your scream`, `my null`, `the silence`.

{% rockstar_include common-variables.rock %}

**Proper variables** are multi-word proper nouns: words which aren’t language keywords, each starting with an uppercase letter, separated by spaces. (Single-word variables are always simple variables.) Whilst some developers may use this feature to create variables with names like `Customer ID`, `Tax Rate` or `Distance In Kilometres`, we recommend you favour idiomatic variable names such as `Doctor Feelgood`, `Mister Crowley`, `Tom Sawyer`, and `Billie Jean`.
#### A note on case sensitivity in Rockstar

Rockstar keywords and variable names are all case-insensitive, with the exception of proper variables. Proper variables are case-insensitive **apart from the first letter of each word, which must be a capital letter.**

- `TIME`, `time`, `tIMe`, `TIMe` are all equivalent. Simple variables are case-insensitive.
- `MY HEART`, `my heart`, `My Heart` - are all equivalent; the keyword `my` triggers **common variable** behaviour
- `Tom Sawyer`, `TOM SAWYER`, `TOm SAWyer` - are all equivalent; the capital `S` on `Sawyer` triggers **proper variable** behaviour
- `DOCTOR feelgood` is not a valid Rockstar variable; the lowercase `f` on `feelgood` does not match any valid variable naming style and so the variable name is not valid.

## Pronouns

As well as referring to variables by name, you can refer to them using pronouns. The keywords `it`, `he`, `she`, `him`, `her`, `they`, `them`, `ze`, `hir`, `zie`, `zir`, `xe`, `xem`, `ve`, and `ver` refer to the current **pronoun subject**.

The pronoun subject is updated when:

* A variable is declared or assigned:

   `My heart is true. Say it` - `it` here refers to `my heart`
* A variable is the left-hand side of a comparison used as the condition in an `if`, `while` or `until` statement

   `If my heart is true, give it back, yeah` - `it` refers to `my heart`

{% rockstar_include pronouns.rock %}

> (Please don’t file issues pointing out that 80s rockers were a bunch of misogynists and gender-inclusive pronouns aren’t really idiomatic. You’re right, we know, and we’ve all learned a lot since then. Besides, [_Look What The Cat Dragged In_](https://en.wikipedia.org/wiki/Look_What_the_Cat_Dragged_In) was recorded by four cishet guys who spent more money on lipgloss and hairspray than they did on studio time, and it’s an absolute classic.)

### The Thing About "Her"

`her` is where Rockstar runs smack into one of the English language's most delightful idiosyncrasies, because the feminine third person pronoun and the feminine possessive are the **same word.**

> Give him his guitar.
> Give them their horns.
> Give her her bass

There is therefore a very specific restriction in the Rockstar grammar: you can't use `her` as a common variable prefix if the second part of the variable is a keyword.

You can have variables called `the times`, `your lies`, `my right`, even though `times`, `lies` and `right` are language keywords, but you can't have `her times` or `her lies` because they'd create ambiguous expressions:

```
A girl is 123
Her times are trying
Say her
Say her times 456

```
## Poetic Literals

One of Rockstar's unique features is the ability to initialise variables using song lyrics.
### Poetic Numbers

A poetic number begins with the `like` or `so` keyword, followed by a series of words. The Rockstar parser takes the length of each word and interprets it as a decimal digit:

{% rockstar_include poetic-numbers.rock %}

Words of 10 or more letters are counted modulo 10, so you can use 10-letter words for `0`, 11 letters for `1` and 12 letters for `2`. Hyphens `-` are counted as letters, so `demon-haunted` is treated as a 12-letter word. Apostrophes are **not** counted, so `nothing` counts as 7 but `nothin'` counts as 6. A poetic number counts every word until the end of the current statement (indicated by a newline or punctuation `.!?;`) If you need a poetic number with a decimal point, use an ellipsis `...`  or the Unicode equivalent U+2026 `…` as the decimal.

{% rockstar_include poetic-numbers-2.rock %}
### Poetic strings
You can initialise string variables without quotes by using the `says` or `said` keyword. This will skip exactly one space character and then capture the rest of the line as a literal string. If the character immediately following the `says` keyword is not a space, it will be included in the string literal.

{% rockstar_include poetic-strings.rock %}

## Ninja Strings

Ninja strings are another unique feature of Rockstar, designed to let you hide strings inside the lyrics of your Rockstar programs. Using the `rock` keyword - which we'll learn more about in the chapter on arrays - you can append characters to the end of a string by providing their Unicode code point - and, combined with the `like` keyword, you can provide that code point as a poetic number:

{% rockstar_include ninja-strings.rock %}

You can initialise a ninja string using the `hold` or `holds` keyword. The left-hand argument is the name of the variable you're initialised, the right-hand side is the poetic number containing the code point of the character:

{% rockstar_include ninja-strings-fizzbuzz.rock %}









