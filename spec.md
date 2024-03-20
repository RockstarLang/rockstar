## The Rockstar Language Specification

Rockstar is intended to give the programmer an unprecedented degree of poetic license when it comes to the composition and structure of their programs. 

### File format

Rockstar programs are [UTF-8](https://en.wikipedia.org/wiki/UTF-8) files with the `.rock` file extension. *(Given that for everything included in the current Rockstar specification, UTF-8 is indistinguishable from 7-bit ASCII, that's a fancy way of saying they're plain text files.)*

### Comments 

The use of comments in Rockstar programs is strongly discouraged. This is rock'n'roll; it's up to the audience to find their own meaning. If you absolutely insist on commenting your Rockstar programs, comments should be contained in parentheses (). Yes, this means you can't use brackets in arithmetic expressions and may need to decompose complex expressions into multiple evaluations and assignments. 

There is, however, a good use for comments - to mark up your code so people know how to play it!  Comment delimiters "{}" and "[]" are now available, as well.  These are used by the [ChordPro](https://www.chordpro.org/) musical notation system.

Rockstar developers are not into that whole [brevity thing](https://www.urbandictionary.com/define.php?term=Brevity%20Thing). 

``` 
(Initialise Tommy = 1337)
Tommy was a big bad brother. 
```

### Variables

Rockstar supports three kinds of variable names.

**Simple variables** are valid identifiers that are not language keywords. A simple variable name must contain only letters, and cannot contain spaces. Note that Rockstar does not allow numbers or underscores in variable names - remember the golden rule of Rockstar syntax: if you can't sing it, you can't have it. Simple variables are case-insensitive.

```
Variable is 1
Tommy is a rockstar
X is 2
Y is 3
Put x plus y into result
```

**Common variables** consist of one of the keywords `a`, `an`, `the`, `my`, `your` or `our` followed by whitespace and a unique variable name, which must contain only lowercase ASCII letters a-z. The keyword is part of the variable name, so `a boy` is a different variable from `the boy`. Common variables are case-insensitive.

```
My variable is 5
Your variable is 4

Put my variable plus your variable into the total
Shout the total
```

**Proper variables** are multi-word proper nouns - words that aren't language keywords, each starting with an uppercase letter, separated by spaces. (Single-word variables are always simple variables.) Whilst some developers may use this feature to create variables with names like `Customer ID`, `Tax Rate` or `Distance In KM`, we recommend you favour idiomatic variable names such as `Doctor Feelgood`, `Mister Crowley`,  `Tom Sawyer`, and `Billie Jean`. 

(Although not strictly idiomatic, `Eleanor Rigby`, `Peggy Sue`, `Black Betty`, and `Johnny B Goode` would also all be valid variable names in Rockstar.)

As in Ruby, Python and VBScript, variables are dynamically typed and you don't need to declare variables before use.

If a variable is defined outside of a function, it is in global scope. Global scope variables are available everywhere below their first initialization. If a variable is defined inside of a function, it is in local scope. Local scope variables are available from their initialization until the end of the function they are defined in.

While within a function, if you write to a variable that has been defined in global scope, you write to that variable; you do not define a new local variable.

#### A note on case sensitivity in Rockstar

Rockstar keywords and variable names are all case-insensitive, with the exception of proper variables. Proper variables are case-insensitive **apart from the first letter of each word, which must be a capital letter.**

* `TIME`, `time`, `tIMe`, `TIMe` are all equivalent. Simple variables are case-insensitive.
* `MY HEART`, `my heart`, `My Heart` - are all equivalent; the keyword `my` triggers **common variable** behaviour
* `Tom Sawyer`, `TOM SAWYER`, `TOm SAWyer` - are all equivalent; the capital `S` on `Sawyer` triggers **proper variable** behaviour
* `DOCTOR feelgood` is not a valid Rockstar variable; the lowercase `f` on `feelgood` does not match any valid variable naming style and so the variable name is not valid.

#### Pronouns

The keywords `it`, `he`, `she`, `him`, `her`, `they`, `them`, `ze`, `hir`, `zie`, `zir`, `xe`, `xem`, `ve`, and `ver` refer to the variable which was most recently assigned a value.

(Please don't file issues pointing out that 80s rockers were a bunch of misogynists and gender-inclusive pronouns aren't really idiomatic. You're right, we know, and we've all learned a lot since then. Besides, [*Look What The Cat Dragged In*](https://en.wikipedia.org/wiki/Look_What_the_Cat_Dragged_In) was recorded by four cishet guys who spent more money on lipgloss and hairspray than they did on studio time, and it's an absolute classic.)

### Types

Rockstar uses a similar type system to that defined by the [ECMAScript type system](http://www.ecma-international.org/ecma-262/5.1/#sec-8), except `undefined` doesn't sound very rock'n'roll so we use `mysterious` instead.

* **Mysterious** - the value of any variable that hasn't been assigned a value, denoted by the keyword `mysterious`
* **Null** - the null type. Evaluates as equal to zero and equal to false. The keywords `nothing`, `nowhere`, `nobody`, and `gone` are defined as aliases for `null`
* **Boolean** - a logical entity having two values `true` and `false`. *(The keywords `maybe` and `definitely maybe` are reserved for future use)*
 * `right`, `yes` and `ok` are valid aliases for `true`
 * `wrong`, `no` and `lies` are valid aliases for `false`
* **Number** - Numbers in Rockstar are double-precision floating point numbers, stored according to the [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) standard. *(An earlier version of this spec proposed that Rockstar used the [DEC64](http://www.dec64.com/) numeric type. This is a perfect example of something that seemed like a great idea after a couple of beers but turns out to be prohibitively difficult to implement...)*
* **String** - Rockstar strings are sequences of 16-bit unsigned integer values representing UTF-16 code units. `empty`, `silent`, and `silence` are aliases for the empty string (`""`).

Functions and function identifiers are not strictly part of the type system in Rockstar 1.0.

## Arrays

Rockstar supports JavaScript-style arrays. Arrays are zero-based, and dynamically 
allocated when values are assigned using numeric indexes.

```$rockstar
Let the array at 0 be "zero"
Let the array at 1 be "one"
Let the array at 255 be "big"
Shout the array at 0
Shout the array at 255
```

Returning an array in a scalar context will return the current length of the array:

```$rockstar
Let my array at 255 be "some value"
Shout my array (will print the value 256)
```

Rockstar also supports non-numeric array keys, so it is valid to say:

```
let my array at "some_key" be "some_value"
Shout my array at "some_key"
```

You can mix string and numeric keys within the same array. The array length property 
ignores any non-numeric keys:

```
Let my array at "some_key" be "some_value"
Shout my array (will print 0, since there are no numeric indexes)
Let my array at 7 be "some other value"
Shout my array (will now print 8, since assigning my array at 7 modifies the array length)
```

You can also use array index syntax to read (but not write) specific characters from a string

```$
Let my string be "abcdefg"
Shout my string at 0 (will print "a")
Shout my string at 1 (will print "b")
Let the character be my string at 2
```

### Queue operations

Rockstar arrays can also be created and manipulated by the queue operations `rock` and `roll`. (The aliases `push` and `pop` are supported for Rockstar developers who are into 80s dance music.)

#### Pushing elements onto an array

To create a new empty array, `rock` the name of the array:

```
Rock the array (the array is now [])
```

To push an element onto the end of an array:

```
Rock the array with the element
```

This supports list expressions, so you can push multiple elements onto the end of an array:

```
Rock ints with 1, 2, 3 (ints is now [1, 2, 3])
Rock the array with the first, the second, and the third
```

Remember the `with` keyword is context-sensitive, so in this example:

```
Rock ints with 1, 2 with 3, 4, 5
          ^         ^
          |         +-- this 'with' is the binary addition operator
          |
          +------------ this 'with' is part of the array push syntax
          
(ints is now [ 1, 5, 4, 5 ])
```

Rockstar supports a special syntax for pushing poetic literals onto a queue:

```rockstar
Rock the array like the poetic literal (the array is now [ 367 ])
Rock the array like a wolf (the array is now [ 367, 14 ])
```

This syntax is very useful for initialising strings without using string literals - see below. It also means that the following line is valid Rockstar:

```
Rock you like a hurricane (you is now [ 19 ])
```

#### Popping elements from an array

The `roll` keyword will remove the first element from an array and return the element that was removed.

```
Rock ints with 1, 2, 3
Roll ints (returns 1; ints is now [ 2, 3 ])
Roll ints (returns 2; ints is now [ 3 ])
Roll ints (returns 3; ints is now [] )
Roll ints (returns mysterious; ints is now [])
```

`roll` can be used in assignments:

```
Rock ints with 1, 2, 3
Let the first be roll ints
Let the second be roll ints
Let the third be roll ints
Shout the first (outputs 1)
Shout the second (outputs 2)
Shout the third (outputs 3)
```

Rockstar also supports a special `roll x into y` syntax for removing the first element from an array and assigning it to a variable:

```
Rock the list with 4, 5, 6
Roll the list into foo
Roll the list into bar
Roll the list into baz
Shout foo (will output 4)
Shout bar (will output 5)
Shout baz (will output 6)
```

### Splitting strings and type conversions

#### A note about mutations

Some operations in Rockstar will either act in-place, modifying the variable passed to them, or will leave the
source variable unmodified and place their output into a target variable. These operations are known as mutation 
operations, and they all have the following syntax:

* `Modify X` - acts in-place 
* `Modify X into Y` - leave `X` alone and put modified output into `Y`
* `Modify X with Z` - modify `X` in-place, with optional parameter `Z`
* `Modify X into Y with Z` - modify `X`, using parameter `Z`, and put results in `Y`

Note that in-place mutations are **only valid where the first argument is a variable**:

#### Splitting Strings

To split a string in Rockstar, use the `cut` mutation (aliases `split` and `shatter`)

String splitting can either operate in-place, or place results into an output variable.
You can specify an optional delimiter; if no delimiter is provided, the string is split
into a character array.

```
Split "a,b,c" into the array (the array is ["a", ",", "b", ",", "c"])
Split "a,b,c" into the array with "," (the array is ["a", "b", "c"])
Split my string (my string will split in-place to an array of characters)
Split my string with x (split my string in-place using the current value of x as a delimiter)

Cut my life into pieces 
  (split my life, put the resulting array in pieces)

Cut your cake with my knife
  (modify your cake in-place, by splitting it using my knife as a delimiter)

Shatter my heart into pieces with your lies
   (Split my heart, using your lies as a delimiter, and put the result into pieces)
```

In-place string splitting is only valid when the first argument is a variable; the 
following would be invalid (because where would the result actually go?)

```$
Split "a,b,c,d,e" with "," (NOT VALID - nowhere to place the output)
Split "a,b,c,d,e" into tokens with "," (valid - tokens now contains ["a","b","c","d","e"])
```

#### Joining Arrays

To join an array in Rockstar, use the `join` mutation, or the alias `unite`

```
Let the string be "abcde"
Split the string into tokens
Join tokens with ";"
    (the tokens now contains "a;b;c;d;e")

The input says hey now hey now now
Split the input into words with " "
Unite words into the output with "! "
    (the output now contains "hey! now! hey! now! now!")
```

#### Parsing numbers and character codes

Use the `cast` mutation (alias `burn`) to parse strings into numbers, or to convert numbers into their corresponding Unicode characters.

```$rockstar
Let X be "123.45"
Cast X
    (X now contains the numeric value 123.45)
Let X be "ff"
Cast X with 16
    (X now contains the numeric value 255 - OxFF)
Cast "12345" into result
    (result now contains the number 12345)
Cast "aa" into result with 16
    (result now contains the number 170 - 0xAA)

Cast 65 into result
    (result now contains the string "A" - ASCII code 65)

Cast 1046 into result
    (result now contains the Cyrillic letter "Ж" - Unicode code point 1046)
```

### Truthiness

The results of comparisons often rely on a concept called 'truthiness'. If the value is truthy, it will be implicitly converted to true. If it is falsy, it will be implicitly converted to false.

- Mysterious - Falsy
- Null - Falsy
- Boolean - Truthy if True, Falsy if False
- Number - If equal to zero, falsy. Otherwise, truthy.
- String - Truthy (null is the falsy equivalent)

### Constants vs Keywords

Words that are used to construct a literal of a certain type are referred to as **constants** and words that are used to construct various syntax constructs are referred to as **keywords**

| Constant     | Aliases                                |
| ------------ | -------------------------------------- |
| `mysterious` | -                                      |
| `null`       | `nothing`, `nowhere`, `nobody`, `gone` |
| `true`       | `right`, `yes`, `ok`                   |
| `false`      | `wrong`, `no`, `lies`                  |
| `empty`      | `silent`, `silence`                    |

### Literals and Assignment

String literals in Rockstar use double quotes. 

* `"Hello San Francisco"`

Numeric literals in Rockstar are written as decimal numbers

* `123`
* `3.141592654`

Assignment is done using either `put <expression> into <variable>` or `let <variable> be <expression>`:


* `Put 123 into X` will assign the value `123` to the variable `X`
* `Put "Hello San Francisco" into the message` will assign the value `"Hello San Francisco"` to the variable `the message`
* `Let my balance be 1000000` will store the value `1000000` in the variable `my balance`
* `Let the survivors be the brave without the fallen` will subtract `the fallen` from `the brave` and store the result in `the survivors`

The keyword `in` is an alias for `into`.

#### Single Quotes

Given Rockstar's intriguing ancestral mixture of computer programming, creative English and idiomatic rock'n'roll, the single quote character presents all sorts of challenges.

Most programming languages use the single quote for quoting literal strings - `'like this'`. English, when written using the basic ASCII character set, often uses the single quote to stand in for the apostrophe to denote contractions or possessives - `you're, she's, he's, shouldn't, rock'n'roll`. Rock'n'roll uses the apostrophe apparently at random - `sweet child o' mine`, `ain't talkin' 'bout love`, `guns n' roses`.

Given three such dramatically different influences, here's how Rockstar interprets single quotes.

1. The sequence `'s` or `'re` appearing at the end of a word is equivalent to ` is`, except when used in poetic literals.

   * This allows `Janie's got a gun` (initialises `Janie` with the value `313`) and `Union's been on strike` (initialises `Union` with the value `426`) as valid variable declarations. `We're here to see the show` initialises `We` with the value `42334`.
   * You can also use `'s` and `'re` in comparisons: `If Janie's gone` tests whether `Janie` is `null`.

2. All other single quotes are then ignored. `ain't` is equivalent to `aint`, `wakin'` has five letters, and `'''''` is equal to the empty string. This means you can use single quotes freely throughout your program to punctuate, adjust word lengths and generally channel the spirit of rock'n'roll without worrying about compiler errors. 

`The fire's burning Tommy's feet` initialises `the fire` with the value `764`.

#### Increment and Decrement

Increment and decrement are supported by the `Build {variable} up` and `Knock {variable} down` statements. Adding more than one `up` or `down` in the statement will increment or decrement the same amount of times as you have `up`s or `down`s in the statement. There may be a comma between each `up` and `down`.

* `Build my world up` will increment the value stored in `my world` by 1.
* `Knock the walls down` will decrement the value stored in `the walls` by 1
* `Knock the walls down, down` will decrement the value stored in `the walls` by 2

#### Operators

Rockstar supports the infix arithmetic operators `+`, `-`, `*` and `/`. The language includes aliases for each operator so you can write lyrically pleasing expressions.

| Operator | Operation         | Aliases            |
| -------- | ----------------- | ------------------ |
| +        | addition          | `plus`, `with` .   |
| -        | subtraction       | `minus`, `without` |
| *        | multiplication    | `times`, `of`      |
| /        | division          | `over`, `between`  |

The alias `by` has been explicitly rejected because of disagreements between the colloquial English `ten by four` (i.e. `10*4 = 40`) and `ten (divided) by four` (i.e. `10/4 = 2.5`)

Examples:

* `Put the whole of your heart into my hands` - multiply `your heart` by `the whole` and assign the result to `my hands`

* `My world is nothing without your love` - Initialize `my world` with the result of subtracting `your love` from 0

* `If the tears of a child are nothing` - check whether `the tears` * `a child` = 0

* `My heart over the moon` - Returns `my heart` divided by `the moon`

#### Compound Assignment Operators

As in many C-style languages, Rockstar supports compound assignment operators, providing a terser syntax for storing the result of an operation. This is done using the `let` keyword.

* `Let X be with 10` - add `10` to `X` and store the result in `X`. (Equivalent to `X += 10`)
* `Let the children be without fear` - subtract `fear` from `the children` and store the result in `the children`
* `Let my heart be over the moon` - equivalent to `my heart /= the moon`

#### Arithmetic Rounding

Rounding in Rockstar is performed by the `turn` keyword. `Turn up` will round up (i.e. towards positive infinity), to the nearest integer; `turn down` will round down (towards negative infinity) to the nearest integer, and `turn round` will round to the nearest integer. Bonnie Tyler enthusiasts will be pleased to note that Rockstar accepts `turn around` as a valid alias.

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
Rounding supports variable [pronouns](#pronouns), so you can write phrases like:

```
My heart is on fire. Aflame with desire.
Turn it up.
Shout it.
```

which will print the value 25 (obviously).

#### List Arithmetic

Rockstar operators support a list of expressions on the right-hand side of the operator. (Imagine explaining in English that, say, "the restaurant bill is the food, plus the drinks, the service, and the tax" - same idea.)

* `Let X be 1 with 2, 3, 4` - shorthand for `X = 1 + 2 + 3 + 4`
* `Let X be "foo" with "bar", and "baz"` - X will be `"foo" + "bar" + "baz"`

You can combine list arithmetic with compound assignment, as with this example:

```
The wolf is hungry, out on the street (initialise the_wolf = 63236)
Fear is the mind killer (fear = 346)
Fury is the demon child (fury = 355)
Hate is the only truth (hate = 345)
Let the wolf be without fear, fury, and hate (the_wolf = the_wolf - 346 - 355 - 345) 
Shout the wolf (output 62190)
```

List arithmetic is only possible where the result type supports further operations.

* `Let X be "foo" times 2, 2, 2` - OK; X is `"foofoofoofoofoofoofoofoo"`
* `Let X be 2 times "foo", "bar"` - is `mysterious` (because `2 * foo = "foofoo"`, and `"foofoo" * "bar"` is undefined)

#### Poetic Literals

Rockstar also supports a unique language feature known as **poetic literals**. Inspired by the [here-document](https://en.wikipedia.org/wiki/Here_document) syntax supported by many scripting languages, poetic literals allow the programmer to simultaneously initialize a variable and express their innermost angst.

##### Poetic Constant Literals

A poetic constant literal is a single line consisting of a variable name, the `is` keyword, or the aliases `are`, `was` or `were`, and a constant signifying the value the variable will be set to.

* `My heart is true` - initialises the variable `my heart` with the Boolean value `true` 
* `Tommy is nobody` - initialises the variable `Tommy` with the value `null` using the `nobody` alias
* `Tommy is mysterious` - initialises the variable `Tommy` with the value `mysterious`.

##### Poetic String Literals

A poetic string literal assignment starts with a variable name, followed by one of the keywords `say`, `says` or `said` followed by a single space. The rest of the line up to the `\n` terminator is treated as an unquoted string literal.

* `Peter says Hello San Francisco!\n` will initialise the variable `Peter` with the string literal `"Hello San Francisco!"`.
* `San Francisco says Hello back\n` will initialise the variable `San Francisco` with the string literal `Hello back`.
* `You say I'm no good for you\n` will initialise the variable `You` with the string literal `I'm no good for you`.
* `My parents said we'd never make it\n` will initialise the variable `My parents` with the string literal `we'd never make it`.

#### Poetic Number Literals

A poetic number literal begins with a variable name, followed by the keyword `is`, or the aliases `are`, `was` or `were`. As long as the next symbol is not a Literal Word, the rest of the line is treated as a decimal number in which the values of consecutive digits are given by the lengths of the subsequent barewords, up until the end of the line. To allow the digit zero, and to compensate for a lack of suitably rock'n'roll 1- and 2-letter words, word lengths are parsed modulo 10. A period (.) character denotes a decimal place. Other than the first period, any non-alphabetical characters are ignored.

* `Tommy was a lovestruck ladykiller` initialises `Tommy` with the value `100`
* `Sweet Lucy was a dancer` - initialises `Sweet Lucy` with the value 16
* `A killer is on the loose` - initialises `a killer` with the value 235.
* `My dreams were ice. A life unfulfilled; wakin' everybody up, taking booze and pills` - initialises `my dreams` with the value `3.1415926535`
* `Tommy was without` initialises `Tommy` with the value `7` because `without` is a Reserved Keyword, but not a Literal Word.
 * Note that poetic literals **can** include Reserved Keywords, as with `taking` in this example.
 * The hyphen (`-`) is counted as a letter – so you can use terms like 'all-consuming' (13 letters > 3) and
    'power-hungry' (12 letters > 2) instead of having to think of 12- and 13-letter words.
 * The semi-colon, comma, apostrophe and any other non-alphabetical characters are ignored.

### Comparison

Similar to the single-equals operator in Visual Basic and some scripting languages, the `is` keyword in Rockstar is interpreted differently depending whether it appears as part of a statement or as part of an expression. `isn't` is the logical negation of the `is` keyword.

Comparison in Rockstar can only be done within an expression.

* `Tommy is nobody` initialises the variable `Tommy` with the value `nobody`
* `If Tommy is nobody` - will execute the following block if, and only if, the variable `Tommy` is equal to `nobody`

Comparison can also be done with any alias of `is`:

* `If he's gone`
* `If we are the future`
* `If the cat was mysterious`
* `If dreams were real`

The keyword `ain't` (which is reduced to `aint` by Rockstar) is an alias for `isn't`. This usage runs contrary to idiomatic English, where "Tommy isn't anybody", "Tommy ain't nobody" and "Tommy ain't not nobody" somehow mean exactly the same thing.

`aren't`, `wasn't`, and `weren't` are also aliases for `isn't`.

Rockstar also supports the following comparison syntax:

* `is higher/greater/bigger/stronger than` to denote 'greater than'
* `is lower/less/smaller/weaker than` to denote 'less than'
* `is as high/great/big/strong as` to denote 'greater than or equal to'
* `is as low/little/small/weak as` to denote 'less than or equal to'

### Logical Operations

Rockstar has 4 different logical operators that first convert their operand(s) to a boolean by truthiness.

* `A and B` returns the [Conjunction](https://en.wikipedia.org/wiki/AND_gate)
* `A or B` returns the [Disjunction](https://en.wikipedia.org/wiki/OR_gate)
* `A nor B` returns the [Joint Denial](https://en.wikipedia.org/wiki/NOR_gate)
* `not A` returns the [Negation](https://en.wikipedia.org/wiki/Inverter_(logic_gate)) of its single argument.

All logical operators are short circuiting. This means if evaluating the first argument to the operator guarantees a result, the other argument is not evaluated. `false and 1 over 0` is `false` and does not produce an error for dividing by zero.

### Input/Output

Use the `Listen` keyword to read one line of input from `STDIN`. Use `Listen to` to capture the input into a named variable.

* `Listen to your heart` - read one line of input from `STDIN` and store it in `your heart`

Use the `Say` keyword to write the value of a variable to `STDOUT`.

* `Say Tommy` - will output the value stored in `Tommy` to `STDOUT`

Rockstar defines `Shout`, `Whisper` and `Scream` as aliases for `Say`

The following examples all use c style syntax for explaining what things do.

### Types Continued

#### Operator Precedence

The higher, the tighter the binding. This is the precedence we generally expect from our math.

1. Function Call (greedy arguments)
2. Logical NOT (right-associative)
3. Multiplication and Division (left-associative)
4. Addition and Subtraction (left-associative)
5. Comparison operators (left-associative)
6. `and`, `or`, and `nor` (left-associative)

##### Examples

- `A taking B times C plus not D times E and F` is equivalent to `((A(B) * C) + (!D * E)) && F`

#### Binary Comparison

Equality comparisons (`is`, `ain't`, `is not`) are allowed between types if they are the same type or they can be compared by the rules below. Two arrays are equal if their elements are equal.

Ordering comparisons (`is higher than`, `is lower than`, `is as high as`, and `is as low as`) are only allowed if the operands are both Numbers or both Strings or they are converted to such an arrangement according to the rules below. Numbers are compared as expected. Strings are compared lexicographically.

- \<Mysterious\> \<op\> Mysterious =\> Equal.
- \<Non-Mysterious\> \<op\> Mysterious =\> Non equal.
- String \<op\> Number =\> Convert the string to a number using base 10 with leading zeros ignored. If it fails, return false.
- String \<op\> Boolean =\> Convert the string to a boolean. The empty string is false; all other strings are true.
- String \<op\> Null =\> Non equal.
- Number \<op\> Boolean =\> Convert number to boolean by "truthiness".
- Number \<op\> Null =\> Convert null to 0.
- Boolean \<op\> Null =\> Convert null to false.

##### Examples

- `"1" is 1` evaluates to true because `"1"` gets converted to the number `1`
- `"2" ain't Mysterious` evaluates to true because all types are non equal to mysterious, besides mysterious itself. 
- `"02" < "10"` is true because the lexicographical comparison between `0` and `1` shows that the first string is less than the second string.
- `True < 10` is an error because `10` gets coerced into `True` due to the comparison with a boolean and there are no allowed ordering comparisons between booleans.

#### Increment and Decrement Operators

- \<op\> String =\> Error
- \<op\> Boolean =\> Invert Boolean
- \<op\> Null =\> coerce to zero (`My world is nothing / build my world up` can be used to initialise a counter loop, for example.)
- \<op\> Mysterious =\> Error

#### Binary Operators

Conversions other than those listed are errors.

- String \<plus\> Number =\> Convert the number to a base-10 string, retaining all precision, but removing unnecessary digits. A leading zero is considered necessary for numbers with no whole part, eg. `00.1000` gets serialized to `0.1`
- String \<plus\> Boolean =\> Convert the boolean to `true` or `false`
- String \<plus\> Null =\> Convert the null to `"null"`
- String \<plus\> Mysterious =\> Convert the mysterious to `"mysterious"`
- String \<times\> Number =\> String gets repeated \<Number\> times

### Flow Control and Block Syntax

#### Conditionals

Conditional expressions start with the `If` keyword, followed by an expression. If the expression evaluates to `true`, then the subsequent code block is executed. Optionally, an `Else` block can be written after an `If` block. The code block following the `Else` keyword would be executed if the `If` expression evaluated to `false`.

For the purpose of conditional expressions, 0, `mysterious`, `null`, `false`, and the empty string all evaluate to `false`, and everything else to `true`.

#### Loops

Similar to the `If` statement, a loop is denoted by the `While` or `Until` keyword, which will cause the subsequent code block to be executed repeatedly whilst the expression is satisfied:

```
Tommy was a dancer
While Tommy ain't nothing,
Knock Tommy down
```

That'll initialize Tommy with the value 16 (using the poetic number literal syntax) and then loop, decrementing Tommy by 1 each time until Tommy equals zero (i.e `ain't nothing` returns false).


The `break` and `continue` statements work as they do in most block-based languages. Rockstar defines `Break it down` as an alias for `break` and `Take it to the top` as an alias for `continue` 

#### Blocks

A block in Rockstar starts with an `If`, `Else`, `While` or `Until` statement, and is terminated by a blank line or the end-of-file. EOF ends all open code blocks

```
Tommy was a dancer
While Tommy ain't nothing
Shout it
Knock it down

```

### Functions

Functions are declared with a variable name followed by the `takes` keyword (alias `wants`) and a list of arguments separated by one of the following: `and` `,` `&` `, and` `'n'`

* `Multiply takes X and Y`
* `Search takes Needle and Haystack`
* `Polly wants a cracker`

The function body is a list of statements with no separating blank lines. A blank line denotes the end of a function body. Functions in Rockstar always have a return value, specified by the `return` keyword and its aliases `give` and `send`. For historical reasons, `give back` is also supported as an alias for `return`, and the return statement can be followed by the keyword `back` (which has no effect but can make code more lyrical). 

```
(This function adds 9 to its input and returns the result)
Polly wants a cracker
Cheese is delicious
Put a cracker with cheese into your mouth
Give it back
```

Functions are called using the 'taking' keyword and must have at least one argument. Multiple arguments are separated with one of the following: `,` `&` `, and` `'n'`.

Arguments may be any valid expression, including literals, arithmetic expressions and function calls.

* `Multiply taking 3, 5` is an expression returning (presumably) 15
* `Search taking "hands", "lay your hands on me"`
* `Put Multiply taking 3, 5, and 9 into Large` will set Large to `3 * 5 * 9` **NOT** `(3 * 5) && 9`.
