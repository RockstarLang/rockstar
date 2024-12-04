---
title: Changes from Rockstar 1
layout: docs
examples: /examples/11-changes-from-v1/
nav_order: "1011"
summary: "Great songs get rerecorded. Great records get remastered. Rockstar 2 introduced a bunch of new features, and a handful of breaking changes."
---

In 2024, Rockstar was ported from JavaScript to C#/.NET, so that we could publish[ native binaries](https://github.com/RockstarLang/rockstar/releases) for Windows, Linux and macOS, and a web-based interpreter using WebAssembly.

The old JavaScript interpreter powered by Satriani is still online at [old.codewithrockstar.com](https://old.codewithrockstar.com) but all future development will be on the .NET engine, which is codenamed "Starship" [for reasons that will become obvious](https://youtu.be/IDI2WQJyE7I?t=100).

# Breaking Changes

## End blocks with `oh`,  `yeah`, `baby`

In Rockstar 1, the only way to end a block was with a blank line, which got very confused if you had loops inside conditionals inside functions inside functions.

In Rockstar 2, you can end a block with the keywords `oh`, `yeah` and `baby`. `Ooh` ends two nested blocks, `oooh` ends three nested blocks, and so on.

See [flow control: this is the end, oh yeah baby](07-flow-control.html#this-is-the-end-oh-yeah-baby).

End-of-block keywords (EOBs) must either be prefixed with a comma `,` or appear at the start of a new line.

## New pronouns `you`, `i`, `me`

As well as the existing pronouns `it`, `he`, `she`, and so on, Rockstar 2 adds the pronouns `you`, `i` and `me`. Among other things, this will break programs which use `i` as an index variable in a loop.

## Comparisons update the pronoun subject

Consider this program:

```rockstar
My variable is 1
Your variable is 2
If my variable is 1
shout it


```

In Rockstar 1, `it` always points at the most recently assigned variable -- `your variable` here -- so the program prints `2`.

In Rockstar 2, the pronoun subject is also updated whenever a variable is the left-hand side of a comparison expression, so after evaluating `if my variable is 1`, any pronoun will resolve to `my variable`, and the program prints `1`.

## Poetic literals can't start with an expression keyword.

In Rockstar 1, this:

```rockstar
The heartbreak is with the night 
```

would initialise `The heartbreak` with the value `435`, by parsing `with the night` as a poetic literal.

In Rockstar 2, if the right-hand side of an `is` assignment starts with an expression keyword, it is evaluated as an expression, not as a poetic literal, so `The heartbreak is with the night` is equivalent to `The heartbreak += the night`

Expression keywords are:

* Arithmetic operators: `plus` `with` `minus` `without` `times` `of` `divided by` `over`
* Logical operators `and` `or` `not` `non`
* Null literal `null` `nothing` `nowhere` `nobody` `gone`
* Boolean literal `true` `yes` `ok` `right` `false` `no` `lies` `wrong`
* String literal `empty` `silent` `silence`
* Undefined literal `mysterious`

## Decimal poetic literals - `...` replaces `.`

In Rockstar 2, a single period `.` followed by a non-period character can be used to indicate the end of a statement, including assigning a poetic literal.

To initialise a decimal poetic literal, use **three** dots `...`or the Unicode ellipsis U+2026 …)

## `like`, `so` and `now`

In Rockstar 2, you can use a poetic literal anywhere by prefixing it with the `like` or `so` keywords:

```rockstar
Heartbreak is 456
If heartbreak is like such sweet sorrow (hearbreak == 456)
Shout heartbreak, yeah

Ricky is so so wrong
Shout Ricky (prints: 25)
```

Conversely, you can force the right-hand side of an assignment to be evaluated as an expression by using the `now` keyword:

```rockstar

My heart is a kaleidoscope lit with dying embers
Whisper my heart (prints: 123456)

The answer is my heart (interprets 'my heart' as a poetic literal)
Whisper it (prints: 25)
The answer is now my heart (interprets 'my heart' as an expression)
Whisper it (prints: 123456)
```

## `the world`, `the outside`

In Rockstar 2, `the world` and `the outside` always refer to the command-line arguments array, and cannot be reassigned.

# New Language Features

## Ninja Strings

Rockstar 1 used `rock <list> with <value>` to append values to a list expression.

In Rockstar 2, `rock` is overloaded for strings:

* `rock <string> with <string>` - concatenate strings
* `rock <string> with <number>` - convert `<number>` to the corresponding character based on the Unicode code point, and append the result to `<string>`

The `with` keyword is optional, so you can just write:

```rockstar
My string is empty
Rock my string 65, 67, 47, 68, 67
Shout my string
```

and because numbers can be represented with poetic literals using the `like` keyword, you can build obfuscated strings that don't appear anywhere in the program source code:

```rockstar
My world is empty
Rock it like guitar shred
Rock it like vocals soaring
Rock it like drum thunder
Rock it like boomin' bassline
Rock it like smooth bourbon 
Shout it
```

Hence 'ninja strings' - because they're[ frikkin' awesome, and you don't see them coming.](https://www.realultimatepower.net/ninja/ninja2.htm)

## Ending statements with punctuation

In Rockstar 1, the only way to end a statement was with a newline:

```rockstar
Shout 1
Shout 2
Shout 3
Shout 4
```

In Rockstar 2, you can also end a statement with punctuation marks `.`, `?`, `!`, `;`:

```rockstar
Shout 1! Shout 2. Shout 3? Shout 4; shout 5
```

> Note that you can use a comma `,` between a statement and and end-of-block keyword `oh` `yeah` `baby`, but a comma does **not** end a statement.

## For-each and for-every loops

Rockstar now supports `for each` and `for every` - see [looping over arrays](09-arrays#looping-over-arrays).

### Strict equality

Rockstar 2 supports [strict equality](05-boolean-logic#strict-equality):

```rockstar

if 1 is true shout "yeah" otherwise shout "no" (prints: yeah)
if 1 is really true shout "yeah" otherwise shout "no" (prints: no)
```

## Nested comments

Rockstar 2 can have nested comments (like this (see?)) 

## Arithmetic

Rockstar 1 would return `NaN` for operations like subtracting or multiplying strings.

Rockstar 2 never returns `NaN`: every arithmetic operator is defined for any combination of argument types.

```rockstar
shout "rockstar" - "star" (prints: star)
shout "ratskcor" times -1 (prints: rockstar)
shout true / "t" (prints: 1)
shout "ad" times "c" (prints: acdc)
```

See [arithmetic](04-arithmetic) for detailed examples of how various operations apply to various types.

## Wildcard keywords

Rockstar 1 used `take it to the top` as a `continue` statement, but you might want to take it somewhere else (the limit, perhaps?), so in Rockstar 2, `break`, `take` and `continue` are **wildcard keywords**; everything up until the next end of statement is ignored.

```rockstar
While true, break me off a piece of chocolate, baby, shout "hello"
```