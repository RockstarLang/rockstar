---
title: Arrays and Collections
layout: docs
examples: /examples/09-arrays/
nav_order: "1008"
summary: Whether it's a set list, the stack of 4x12 speaker cabinets, or the queue of eager fans waiting to get into the show, rock'n'roll is all about collections. Just no hashes until after the show, OK?
---
## Arrays

Rockstar supports JavaScript-style arrays. Arrays are zero-based, and dynamically allocated when values are assigned using numeric indexes. Array elements are initialised to `null`; passing an out-of-range index returns `mysterious`:

{% rockstar_include basic-arrays.rock %}

> Array indexers can be primary values or arithmetic expressions, but **you can't use a logical expression as an array indexer.**
>
> Consider `My array at 2 is 4`
>
> If not for this restriction, the parser would consume `2 is 4` as a comparison *("2 is 4 - true or false?")*, return `false`, try to set `My array at false` and then blow up 'cos there's nothing to put in it.

Returning an array in a numeric context will return the current length of the array:

{% rockstar_include array-length-as-scalar.rock %} 

> Under the hood, a Rockstar array actually contains two collections, known as the *list* and the *hash*. The list is an integer-indexed linear list of values; when you push, pop, rock and roll arrays, you're modifying the list. If you set elements whose key is not a non-negative integer, those elements are stored in the *hash*. 

Array indexes can be of any type, and you can mix key types within the same array. The array length only considers keys whose values are non-negative integers:

{% rockstar_include non-integer-keys.rock %}

Arrays in Rockstar are one-dimensional, but they can contain other arrays:

{% rockstar_include non-integer-keys.rock %}

You can use indexes to read characters from strings, and extract bits from numbers. You can also use indexers to modify individual characters in a string:

{% rockstar_include indexers-for-scalar-types.rock %}

Trying to assign an indexed value to an existing variable which is not an array will cause an error:

{% rockstar_include invalid-assignment.rock %}

### Looping over arrays

To loop over the *list* elements of an array, use `for <value> in <array>` If you also need the index of each element, use `for <value> and <index> in <array>`:

{% rockstar_include for-in.rock %}

To loop over the *hash* elements of an array, use `for <key> of <array>` - this will call the loop once for each element in the hash, setting *key* to the key of that element. If you need the element values as well, use `for <key> and <value> of <array>`:

{% rockstar_include for-of.rock %}

This can lead to some slightly odd-sounding lyrics:

```
For star in the sky
Whisper star
Yeah
```

so you can use the `every` keyword, which will prepend `the ` to the variable names assigned inside the body of the loop:

```
For every star in the sky
Whisper the star
Yeah
```
### Queue operations

Rockstar arrays can also be created and manipulated by the queue operations `rock` and `roll`. `push` and `pop` are supported for Rockstar developers who are into 80s dance music.
#### Pushing elements onto an array

To create a new empty array, `push` or `rock` the name of the array. To push an element onto the end of the array, `push <array> <expression>`.

{% rockstar_include rock-and-roll.rock %}

You can rock list expressions, so you can push multiple elements onto the end of an array:

{% rockstar_include rock-and-roll-tommy.rock %}

If it makes for better lyrics, you can use the `with` keyword - `rock <array> with <expression>`. Remember the `with` keyword is context-sensitive, so in this example:

```
Rock ints with 1, 2 with 3, 4, 5
          ^         ^
          |         +-- this 'with' is the binary addition operator
          |
          +------------ this 'with' is part of the array push syntax

(ints is now [ 1, 5, 4, 5 ])
```

This syntax is very useful for initialising strings without using string literals - see below. It also means that the following is valid Rockstar:

{% rockstar_include the-scorpions.rock %}
#### Popping elements from an array

The `roll` keyword will remove the first element from an array and return the element that was removed.

{% rockstar_include roll.rock %}
`roll` can be used in assignments:

{% rockstar_include roll-assign.rock %}

Rockstar also supports a special `roll x into y` syntax for removing the first element from an array and assigning it to a variable:

{% rockstar_include roll-into.rock %}

## Array Arithmetic

As with strings, Rockstar tries hard to return *something* in every scenario, just in case one day somebody out there finds it useful.

Adding arrays to numbers adds the *length* of the array (this is the same logic that kicks in when you test an array to see if there's anything left in it.) Adding anything else to an array will append it to the end of the array.

{% rockstar_include adding-arrays.rock %}

Subtracting arrays from arrays will return a new array, created by removing any elements in the second array from the elements of the first.

* List elements are removed if the *value* is present
* Hash elements will be removed if they match both the key and the value.

 Subtracting any other value from an array returns a new array with any instances of the subtracted element removed.
 
{% rockstar_include subtracting-arrays.rock %}




