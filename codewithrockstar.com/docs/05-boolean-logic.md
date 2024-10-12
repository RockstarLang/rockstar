---
title: Binary Logic
layout: docs
nav_order: "1003"
summary: Truth, truthiness, false, falseyness... and Rockstar is the only programming language in the world in which a variable can be totally non non non non NON heinous.
---
## Truthiness

Every possible value in Rockstar evaluates to either true or false -- this is known as **truthiness**. The only things in Rockstar which are **falsy** are:

* `false`
* `null`
* `mysterious`
* the empty string `""`
* the number `0`

Everything else is truthy, which means if you put in in a Boolean context (such as the condition of an `if` statement) it'll be 'true'.
### Unary Not

Unary not in Rockstar uses the keywords `not` and `non-`:

{% rockstar_include unary-not.rock %}

### Binary Logic

Rockstar supports binary logic expressions using the keywords `and`, `or`,  and `nor`.

{% rockstar_include basic-logic.rock %}

`not` has the highest precedence, then `and`, then `or`, then `nor`:

{% rockstar_include operator-precedence.rock %}

### Binary Logic for Non-Boolean Types

Binary logic applied to strings and numbers in Rockstar doesn't necessarily return a Boolean result: it returns whichever of the operands resolves the logical constraint of the expression:#

{% rockstar_include binary-operands.rock %}

The `and` and `or` operators in Rockstar will short-circuit:

* `X or Y`: evaluate `X`. If the result is **truthy**, return it, otherwise evaluate `Y` and return that.
	* **If `X` is truthy, `Y` is never evaluated.**
* `X and Y`:  evaluate `X`. If the result is **falsy**, return it, otherwise evaluate `Y` and return that.
	* **If `X` is falsy, `Y` is never evaluated.**

In the following examples, short-circuiting means the division by zero is never evaluated:

{% rockstar_include short-circuiting.rock %}

## Equality and Comparison

Equality in Rockstar uses the `is`, `was`, `are` and `were` keywords. Equality is determined as follows:

* If one operand is a Boolean, compare it to the truthiness of the other operand:
	* All non-zero numbers and non-empty strings are equal to `true`
* Otherwise, if one operand is a string, compare it with the string representation of the other argument
	*
* Otherwise, the values of the two operands are compared.

{% rockstar_include equality.rock %}

### Inequality

Inequality uses the `isn't` and `ain't` keywords.

> Watch out for `is not`: `not` is the unary negation operator, so `a is not b` will work as expected when `b` is a Boolean, but when `b` is a number or a string, it'll compare `a` with the logical `not` of the truthiness of `b`

{% rockstar_include inequality.rock %}

### Identity
To compare values without performing any type coercion, use the `exactly` keyword, or its aliases `really`, `actually` or `totally`:

{% rockstar_include identity.rock %}

### Comparison

Rockstar supports the following comparison operators:

- `is higher/greater/bigger/stronger than` to denote ‘greater than’
- `is lower/less/smaller/weaker than` to denote ‘less than’
- `is as high/great/big/strong as` to denote ‘greater than or equal to’
- `is as low/little/small/weak as` to denote ‘less than or equal to’

By default, comparison use type coercion:

* If either operand is a string, it's compared to the string representation of the other value
	* This means that `10 < "2"`, because `10` is coerced to the string `10`, which is alphanumerically less than the string `2`
* Otherwise, the numeric values of the operands are compared (`true` is `1`, `null` and `false` are 0)

{% rockstar_include string-comparison.rock %}














