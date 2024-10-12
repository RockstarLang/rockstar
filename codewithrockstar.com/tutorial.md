---
title: Tutorial
layout: main
nav_exclude: true
---
# Do You Wanna Get Rocked?

Welcome! In this tutorial, you'll learn the basics of Rockstar, and find out what makes Rockstar one of the world's most delightfully pointless programming languages.

## Hello, World

"Hello, World" in Rockstar looks like this:

{% rockstar_include print-hello-world.rock play %}

All the examples in this tutorial are interactive: press the "Rock <i class="fa-solid fa-play"></i>" button to try it out and see what it does.

Because Rockstar's designed to write programs that look like song lyrics, it's very relaxed when it comes to syntax. Almost everything in Rockstar is case-insensitive, and most keywords have several different `aliases` so you can pick the one that suits the mood of your program.

{% rockstar_include hello-world-aliases.rock play %}

Try it out. Edit the example above and replace London with your home town.
## Variables in Rockstar

A variable stores a value so you can refer back to it later. In most programming languages, a variable name can't contain spaces, so programmers have to use names like `customerTaxPayable` or `year_end_date`, or `customer-shipping-address`.

Rockstar is not like most programming languages: if you want to put spaces in your variables, you go right ahead. After all, nobody ever wrote a power ballad about `customerTaxPayable`.
### Common Variables

Common variables in Rockstar start with `a`, `the`, `my`, `your`, `their`, `his` or `her`. To assign a value to a variable, use `put`, `is`, or `let`[^1]

{% rockstar_include common-variables.rock play %}

You might also notice we've got three statements on the same line there. That's just fine, because each statement ends with full stop - just like regular English. Statements in Rockstar can end with a full stop `.`, question mark `?`, exclamation mark `!`, semi-colon `;`, or a line break.
### Proper Variables

Proper variables in Rockstar are two or more words which must all begin with a capital letter. Initials are allowed -- `Johnny B. Goode` -- but abbreviations aren't: you can't have a variable called `Mr. Crowley` because Rockstar treats the `.` in `Mr.` as the end of a statement:

{% rockstar_include proper-variables.rock play %}

Simple Variables

If you *really* want to, you can use **simple variables**, which work just like variables in Python, Ruby, and many other programming languages:

{% rockstar_include simple-variables.rock play %}
## Types and Expressions

Rockstar supports numbers and basic arithmetic expressions:

{% rockstar_include basic-arithmetic.rock play %}

Problem is, there's only [one good song about mathematics](https://open.spotify.com/track/4e5XPD3qh9miordZiBf5jp?si=9e5ea3937ca8462d) and Little Boots already wrote it, so all the arithmetic operators in Rockstar support aliases. Instead of `+`, use `plus` or `with`. `-` can be `minus` or `without`, `*` can be `times` or `of`, and `/` is `over` or `divided by`:

{% rockstar_include lyrical-arithmetic-1.rock play %}

This is also probably a good time to mention that you can't use brackets in Rockstar. Well, you can, but they're used to indicate comments (like this) - because that's how lyrics work.

{% rockstar_include lyrical-arithmetic-2.rock play %}

Rockstar will let you add, multiply, subtract and divide just about anything - check out the docs to find out exactly how this works, or just try stuff out and see what happens. Remember, this is a joke language based on Bon Jovi songs. You're not gonna break anything important.

{% rockstar_include rockstar-arithmetic.rock %}
## Poetic Numbers

You notice in the last example, I wrote `Let Tommy be a boy with a dream` - and not `Tommy is a boy with a dream`?

Try this:

{% rockstar_include ricky-was-a-young-boy.rock play %}

...OK, where did `153231525` come from? 

Welcome to one of Rockstar's most unusual features: **poetic literals**.

When you initialise a variable using `is`, `was` or `were`, if the thing on the right-hand side doesn't start with a digit `0-9`, or with one of the arithmetic operator keywords (`plus`, `with`,  etc.) Rockstar treats it as a **poetic number**. It'll take the length of each word, modulo 10, and interpret those word lengths as decimal digits.

So `Ricky was a young boy, he had a heart of stone`, gives us:

```
a young boy, he had a heart of stone
1   5    3    2  3  1   5   2    5
```

A poetic number includes everything up to the end of the line, so watch out for statements like `Lucy was a dancer. Say Lucy!` - that's not going to print `Lucy`, it's going to assign `Lucy` the value 1634. Poetic numbers count hyphens (`-`) and ignore all other punctuation, so you can use phrases like `cold-hearted` for the digit `2` instead of having to think of 12-letter words.

If you want to use a poetic number anywhere else in your Rockstar program, prefix it with the `like` keyword: `Let my variable be like a rolling stone` will initialise `my variable` with the value `175`.
## Viewing the Parse Tree
Features like poetic numbers can make it hard to figure out exactly what a Rockstar program is doing, so the Rockstar engine that runs on this website also allows you to see the **parse tree** - an abstract representation of the structure of your Rockstar program. Try clicking "Parse <i class="fa-solid fa-list-tree"></i>" here and see what you get:

{% rockstar_include parse-trees.rock play,parse %}
## Strings

No, not that kind of strings. Strings are how Rockstar handles text. A string in Rockstar is surrounded by double quotes; to include double quotes in a string, use two sets of double quotes. You can also use **poetic string** syntax using the `says` keyword:

{% rockstar_include strings.rock play,parse %}

## Reading Input

To read input from the console, use `listen`. `Listen` on its own will read a line of input from STDIN and discard it. `Listen to <variable>` will read the next line of input from STDIN and store it in `<variable>` as a string.

> For all kinds of complicated reasons, the Rockstar engine that runs on this website can't prompt you for input, so you'll need to provide the input in advance using the text box below the Rockstar editor.

{% rockstar_include listen.rock %}
## Ninja Strings

The problem with literal strings is they often don't fit the mood of the song you're trying to write. `FizzBuzz` is all well & good, but shouting the word "fizz" in the middle of power ballad just isn't gonna work.

To get around this, Rockstar includes a feature that lets you build strings without ever having to refer to them directly: we call these **ninja strings**, because like ninjas, they are both stealthy *and* awesome.

* `<variable> holds <poetic number>` - will convert `<poetic number>` to the Unicode character with the corresponding code point, and assign `variable` to the resulting string.
* `rock <variable> <number>` - will add characters to the end of a string based on their code points - and because you can use the `like` keyword:
* `rock <variable> like <poetic_number>` will build a string out of pure poetry.

{% rockstar_include ninja-strings.rock play,parse %}
## Booleans, Null, and Mysterious

As well as numbers and strings, Rockstar has boolean types, null, and mysterious.

Booleans are `true` - aliases `right`, `yes`, and `ok` - and `false`, with its aliases `wrong`, `no`, and `lies`. 

`null` means a value that's missing or not available yet - aliases `nothing`, `nowhere`, `nobody`. 

Rockstar also has a type called `mysterious`, which works like `undefined` in JavaScript; it's the language's way of saying "not only do I not know what this is, I don't even know how to tell you what's wrong with it." 
## Conditionals and Loops

Conditionals in Rockstar use the `if` keyword, alias `when`, and the `else` / `otherwise` keywords. Loops begin with `while` or `until`. 
 
{% rockstar_include if-else.rock play,parse %}

Multi-line conditionals and loops have to end with an **end of block**. In previous versions of Rockstar, this had to be a blank line. Rockstar 2 adds an explicit `end` keyword, along with the aliases `yeah` and `baby`.

To exit a loop immediately, use the `break` keyword. To skip the rest of the current iteration and restart the loop, use the `continue` keyword or the alias `take`

> `break` and `take` in Rockstar are **wildcard keywords**: you can follow them with anything you like, and everything up until the next end of statement (`,.!?;`) or newline will be ignored. This is mainly because the original Rockstar draft used `take it to the top` as a synonym for `continue`, which sounded cool but is actually incredibly stupid, even by Rockstar standards.

{% rockstar_include break-and-take.rock play,parse %}

### Oh, ooh, oooh yeah, baby

You can also end a Rockstar block with the keyword `oh`. `Ooh` ends **two** blocks, `oooh` ends three blocks, and so on until you get bored or your computer runs out of memory. Think of this like the Rockstar equivalent of `}}}}` in C-style languages, or the `)))))` that ends most Lisp programs.

{% rockstar_include oooh-baby.rock play,parse,reset %}
## Pronouns

Oh, yes, Rockstar has pronouns.[^2] In natural languages, a pronoun is just a way to refer to something based on context, instead of explicitly having to name things every time - it's the difference between "Tommy put his guitar in the back of his car, he drove out into the night" and "Tommy put Tommy's guitar in the back of Tommy's car, Tommy drove out into the night".

Rockstar supports the pronouns `it`, `he`, `she`, `him`, `her`, `they`, `them`, and a whole lot more - see the docs for the full list.

A Rockstar pronoun refers to the last variable which was assigned, or the last variable that appeared as the left-hand side of the test in a conditional or loop statement. That sounds complicated, but it's not: most of the time, you can just use `it`, `him` or `her` in your programs as you would in regular English, and it'll probably work.

{% rockstar_include pronouns.rock play,parse,reset %}

> Remember that although Rockstar has many different pronouns, at any given point in your program, every pronoun points to the same variable -- you can't have `him`, `her` and `it` pointing to different things. Trying to update pronoun subjects based on assumptions about gendered names would be hard enough even if rock'n'roll wasn't full of dudes called Tracii, Alice and Rachel...  you know that on the cover of "Rumours" by Fleetwood Mac, Stevie is the woman and Lindsay is the man? Yeah. You're gonna have to keep track of your own pronouns.

The combination of pronouns and ninja strings means that if you ever *really* need to push an ASCII `DC3` control code onto the end of a string, you can do it using this line of code:

```rockstar
Rock you like a hurricane
```
## Equality and Comparisons

You might have noticed we've started using expressions like `X is 5` in our `if` and `while` loops. Rockstar supports all the logical, equality and comparison operators you'd expect to find in a proper programming language:

{% rockstar_include equality.rock play,parse,reset %}

..hang on, what happened to Dizzy? `not` in Rockstar is a **unary operator**. `X is not 2` is going to evaluate `not 2` first - and `2` in Rockstar is *truthy*, so `not 2` is *falsey*, and then it'll compare `X is falsey`, and `X` is 1, and `1` is truthy, and truthy is not equal to falsey... and so `1 is not 2` is actually false. Check out the docs to find out more about things which are truthy, things which are falsey, and how they all fit together.

{% rockstar_include comparisons.rock play,parse,reset %}

Rockstar also has the Boolean logical operators `and`, `or`, `nor`, and `not`.

{% rockstar_include boolean-logic.rock play,parse,reset %}

Boolean operators in Rockstar will **short-circuit** - if you evaluate `X and Y`, and `X` is false, then `Y` will never be evaluated because there's no way `X and Y` can be true - and, like JavaScript, they'll return the last evaluated operand necessary to resolve the expression:

{% rockstar_include short-circuits.rock play,parse,reset %}
## Functions

Functions in Rockstar are declared with the `wants` or `takes` keywords, followed by the list of variables denoting the function's arguments. If you want to declare a function that has no arguments, specify `null`, `wants nothing` or `takes nothing`.

To call a function, use `taking`, or `call <function> with <arguments>`.

{% rockstar_include functions.rock play,parse,reset %}

The arguments in a function *call* must be separated with commas, ampersands, nactons, or the Oxford comma. 

> **Nacton** *(n.)* The 'n' with which cheap advertising copywriters replace the word 'and' (as in 'fish 'n' chips', 'mix 'n' match', 'assault 'n' battery'), in the mistaken belief that this is in some way chummy or endearing.  
> -- *"The Meaning of Liff", Douglas Adams & John Lloyd*

Rockstar supports both the UK nacton (`fish'n'chips`) and the US nacton (`Guns n' Roses`).

When you *declare* a function, you can even use `and` to separate the arguments -- because at that point in the language, it can't possibly mean anything else.

{% rockstar_include function-list.rock play,parse,reset %}
## Rock'n'Roll Arrays

Arrays in Rockstar are created with the `rock` keyword, alias `push`. 

As we've already seen when we learned about **ninja strings**, rocking a string with a number will turn the numbers into a character and append it to the end of the string. This is a special case, because it's so incredibly useful for building strings. 

In all other cases, `rock x` will turn `x` from a scalar into a single-element array `[ x ]`, and `rock x with y` will append `y` to the end of the array denoted by `x`.

If you just `rock` a new variable, it'll create an empty array. If you rock a new variable with a list of things, it'll add those things to the new array:

{% rockstar_include basic-arrays.rock %}

Naturally, if you can `rock`, you can `roll`. `Roll` will remove and return the first element of the array.

{% rockstar_include rock-and-roll.rock %}
### Pop? Really?

Yes, pop. If you `rock` and `roll` arrays, they work like queues - first in, first out. If you want your array to behave like a stack, use `push` and `pop`:

{% rockstar_include push-and-pop.rock %}

> `push` is actually an alias for `rock` - it adds the provided element to the *end* of the array; `roll` removes and returns the *last* element, while `pop` removes and returns the `first` element. 

## Conversions and Mutations

Finally, Rockstar has a handful of built-in functions for doing useful things. These operations can either act in place, *mutating* the variable passed to them, or leave the result in a target variable and leave the source unmodified:

* `Modify X` - acts in-place
* `Modify X into Y` - leave `X` intact, store the result into `Y`
* `Modify X with Z` - act in place, using optional parameter `Z`
* `Modify X into Y with Z` - modify `X` using `Z`, store the result in `y`

### Splitting Strings

To split a string in Rockstar, use the `cut` mutation, or aliases `split` and `shatter`:

{% rockstar_include split-strings.rock %}

### Joining Arrays

To join an array in Rockstar, use the `join` mutation, or the aliases `unite` or `gather`:

{% rockstar_include join-arrays.rock %}

### Type Conversions

The built-in `cast` function (aka `burn`) will parse strings into numbers, or convert a number into a Unicode character corresponding to the number's code point.

{% rockstar_include cast.rock %}

If you just want to convert a value into a string, add it to the empty string:

{% rockstar_include with-empty.rock %}
### Cast

[^1]: Technically `let` will declare a new variable in local scope, where `put` and `is` will declare or assign a global variable. It's complicated. See the documentation on variable scope if you really care.
[^2]: Rockstar is also woke, fetch, rizz, cheugy, *and* skibidi, no cap -- but that's not why it has pronouns. 