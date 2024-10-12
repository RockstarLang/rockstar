---
title: Expression Lists
layout: docs
examples: /examples/06-expressions/
nav_order: "1005"
summary: What's the difference between a variable list, an expression list, and a primary list? Do you care? We care. Not a lot, but we do.
---
## Expression lists

There are many places in Rockstar where you can provide a list in place of an expression... and if you can have a list of expressions, and an expression can be a list, things get all wibbly-wobbly and you can go all cross-eyed.

{% rockstar_include expression-lists.rock %}

Let's start with the easy one: a **variable list**

Variable lists are used to declare the arguments to a function. **They can only contain variable names**, and variables must be separated by one of:

* A comma `,`
* An ampersand `&`
* The keyword `and`
* The Oxford comma `, and`
* A *nacton*

> **Nacton** *(n.)* The 'n' with which cheap advertising copywriters replace the word 'and' (as in 'fish 'n' chips', 'mix 'n' match', 'assault 'n' battery'), in the mistaken belief that this is in some way chummy or endearing.
>
> 	- "The Meaning of Liff", Douglas Adams & John Lloyd

Rockstar supports both the **UK nacton** `'n'` (as in *fish 'n' chips*) and the **US nacton** `n'` (as in *Guns n' Roses*.)

{% rockstar_include variable-lists.rock %}

Then there's an **primary list**, used to provide arguments to a function. The elements in a primary list must be **primaries**, and you **can't separate a primary list with an Oxford comma** - if the parser sees `, and`, that means the primary list is finished and move on to the next thing.

{% rockstar_include primary-lists.rock %}

Rockstar grammar supports three different kinds of lists:

* Expression lists
* Variable lists
* Primary lists

Foo is 1 with 2 + 3, 4, 5 and 6, bar taking 7, 8 and 9, 10, "yeah"

First, `8 and 9` cannot be a function argument (functions only accept primaries), so `bar taking 7` is an expression:

Foo is 1 with 2 + 3, 4, 5 and 6, (bar taking 7), 8 and 9, 10, "yeah"

Second, ` and `  (with no leading comma) is always the logical-and operator, and the right-hand operand in a logic expression can't be a list:

Foo is 1 with 2 + 3, 4, (5 and 6), (bar taking 7), (8 and 9), 10, "yeah"

So now we propagate the `+` operator to each adjacent pair of arguments

Foo is 1 + 2 + 3 + 4 + (5 and 6) + (bar taking 7) + (8 and 9) + 10 + yeah

So from the left:

1 with (2 + 3, 4, )

The most restrictive is the **primary list**, used in compound arithmetic expressions:

Elements in a primary list must be primary expressions. A **primary expression** in Rockstar is anything which yields a value without using any operators. Primaries are literal strings and numbers, variables, function calls, and language constants.

Elements in a primary list are separated by one of:

* Comma `,`
* Ampersand `&`
* A *nacton*

Next, there are **expression lists**. An expression list supports the same separators as the primary list, but also supports the **Oxford comma** separator `, and ` Because you can't put an Oxford comma in a primary list, this means an expression list can contain expressions that themselves contain primary lists; the Oxford comma provides an unambiguous way to separate the sub-expressions.

Expression lists are supported as arguments to compound expressions and when rocking arrays:

{% rockstar_include expression-lists.rock %}

Finally, there are **variable lists**, used to specify the arguments when defining a function.

Because the elements in the list can **only** be variable names, a variable list supports all the separators used in primary and expression lists, and also the bareword ` and ` (with no commas or punctuation required).



