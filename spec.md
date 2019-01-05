## The Rockstar Language Specification

Rockstar is intended to give the programmer an unprecedented degree of poetic license when it comes to the composition and structure of their programs. 

### File format

Rockstar programs are [UTF-8](https://en.wikipedia.org/wiki/UTF-8) files with the `.rock` file extension. *(Given that for everything included in the current Rockstar specification, UTF-8 is indistinguishable from 7-bit ASCII, that's a fancy way of saying they're plain text files.)*


### Comments 
 
The use of comments in Rockstar programs is strongly discouraged. This is rock'n'roll; it's up to the audience to find their own meaning. If you absolutely insist on commenting your Rockstar programs, comments should be contained in parentheses (). Yes, this means you can't use brackets in arithmetic expressions and may need to decompose complex expressions into multiple evaluations and assignments. 
 
Rockstar developers are not into that whole [brevity thing](https://www.urbandictionary.com/define.php?term=Brevity%20Thing). 
 
``` 
Tommy was a lean mean wrecking machine.  (initialises Tommy with the value 14487) 
``` 
 
### Variables

There's two ways to declare and use variables in Rockstar. 

**Common variables** consist of one of the keywords `a`, `an`, `the`, `my` or `your` followed by a unique variable name, which must contain only lowercase ASCII letters a-z. The keyword is part of the variable name, so `a boy` is a different variable from `the boy`.

**Proper variables** are proper nouns - any word that isn't a reserved keyword and starts with an uppercase letter. Proper variable names can contain spaces as long as each space is followed by an uppercase letter. Whilst some developers may use this feature to create variables with names like `Customer ID`, `Tax Rate` or `Distance In KM`, we recommend you favour idiomatic variable names such as `Tommy`, `Gina`, `Doctor Feelgood`, `Mister Crowley`, `Kayleigh`, `Tom Sawyer`, `Billie Jean` and `Janie`. 

(Although not strictly idiomatic, `Eleanor Rigby`, `Peggy Sue`, `Black Betty`, `Layla` and `Johnny B Goode` would also all be valid variable names in Rockstar.)

As in Ruby, Python and VBScript, variables are dynamically typed and you don't need to declare variables before use.

If a variable is defined outside of a function, it is in global scope. Global scope variables are available everywhere below its first initialization. If a variable is defined inside of a function, it is in local scope. Local scope variables are available from their initialization until the end of the function they are defined in.

While within a function, if you write to a variable that has been defined in global scope, you write to that variable, you do not define a new local variable.

**Pronouns**

The keywords `it`, `he`, `she`, `him`, `her`, `they`, `them`, `ze`, `hir`, `zie`, `zir`, `xe`, `xem`, `ve`, and `ver` refer to the last named variable determined by parsing order. 
 
(Please don't file issues pointing out that 80s rockers were a bunch of misogynists and gender-inclusive pronouns aren't really idiomatic. You're right, we know, and we've all learned a lot since then. Besides, [*Look What The Cat Dragged In*](https://en.wikipedia.org/wiki/Look_What_the_Cat_Dragged_In) was recorded by four cishet guys who spent more money on lipgloss and hairspray than they did on studio time, and it's an absolute classic.)

### Types

Rockstar uses a very similar type system to that defined by the [ECMAScript type system](http://www.ecma-international.org/ecma-262/5.1/#sec-8), except `undefined` doesn't sound very rock'n'roll so we use `mysterious` instead.

* **Mysterious** - the value of any variable that hasn't been assigned a value, denoted by the keyword `mysterious`
* **Null** - the null type. Evaluates as equal to zero and equal to false. The keywords `nothing`, `nowhere`, `nobody`, `empty` and `gone` are defined as aliases for `null`
* **Boolean** - a logical entity having two values `true` and `false`. *(The keywords `maybe` and `definitely maybe` are reserved for future use)*
 * `right`, `yes` and `ok` are valid aliases for `true`
 * `wrong`, `no` and `lies` are valid aliases for `false`
* **Number** - Numbers in Rockstar are stored using the [DEC64](http://www.dec64.com/) numeric type. The number internally is the closest representable number of the DEC64 type.
* **String** - Rockstar strings are sequences of 16-bit unsigned integer values representing UTF-16 code units.

Functions are just objects with a function call operator.

### Truthiness

The results of comparisons often rely on a concept called 'Truthiness'. If the value is truthy, it will be implicitly converted to true. If it is falsy, it will be implicitly converted to false.

- Mysterious - Falsy
- Null - Falsy
- Boolean - Truthy if True, Falsy if False
- Number - If equal to zero, falsy. Otherwise, truthy.
- String - Truthy (null is the falsy equivalent)

### Constants vs Keywords

Words that are used to construct a literal of a certain type are referred to as **constants** and words that are used to construct various syntax constructs are referred to as **keywords**

- Constants: `mysterious`, `null`, `nothing`, `nowhere`, `nobody`, `empty`, `gone`, `true`, `right`, `yes`, `ok`, `false`, `wrong`, `no`, `lies`, `maybe`, `definitely maybe`
		
### Literals and Assignment

String literals in Rockstar use double quotes. 

* `"Hello San Francisco"`

Numeric literals in Rockstar are written as decimal numbers

* `123`
* `3.141592654`

Assignment is denoted by the `put/into` keyword combination:

* `Put 123 into X` will assign the value `123` to the variable `X`
* `Put "Hello San Francisco" into the message` will assign the value `"Hello San Francisco"` to the variable `the message`

#### Single Quotes

Given Rockstar's intriguing ancestral mixture of computer programming, creative English and idiomatic rock'n'roll, the single quote character presents all sorts of challenges.

Most programming languages use the single quote for quoting literal strings - `'like this'`. English, when written using the basic ASCII character set, often uses the single quote to stand in for the apostrophe to denote contractions or possessives - `you're, she's, he's, shouldn't, rock'n'roll`. Rock'n'roll uses the apostrophe apparently at random - `sweet child o' mine`, `ain't talkin' 'bout love`, `guns n' roses`.

Given three such dramatically different influences, here's how Rockstar interprets single quotes.

1. The sequence `'s\W+` - a single quote followed by a lowercase 's' and one or more whitespace characters - should be replaced with ` is ` (space, is, space) 
 * This allows `Janie's got a gun` (initialises `Janie` with the value `313`) and `Union's been on strike` (initialise `Union` with the value `426`) as valid variable declarations.  

2. All other single quotes are then ignored. `ain't` is equivalent to `aint`, `wakin'` has five letters, and `'''''` is equal to the empty string. This means you can use single quotes freely throughout your program to punctuate, adjust word lengths and generally channel the spirit of rock'n'roll without worrying about compiler errors. 

#### Increment and Decrement

Increment and decrement are supported by the `Build {variable} up` and `Knock {variable} down` statements. Adding more than one `up` or `down` in the statement will increment or decrement the same amount of times as you have `up`s or `down`s in the statement. There may be a comma between each `up` and `down`.

* `Build my world up` will increment the value stored in `my world` by 1.
* `Knock the walls down` will decrement the value stored in `the walls` by 1
* `Knock the walls down, down` will decrement the value stored in `the walls` by 2
 
#### Arithmetic

Basic arithmetic is provided by the `plus`, `minus`, `times` and `over` keywords.

Arithmetic expressions:

* `{a} plus {b}` - addition. Alias `with`
* `{a} minus {b}` - subtraction. Alias `without`
* `{a} times {b}` - multiplication. Alias `of`
* `{a} over {b}` - division. Aliases TBC.

The alias `by` has been explicitly rejected because of disagreements between the colloquial English `ten by four` (i.e. `10*4 = 40`) and `ten (divided) by four` (i.e. `10/4 = 2.5`)

Examples:

* `Put the whole of your heart into my hands` - multiply `your heart` by `the whole` and assign the result to `my hands`

* `My world is nothing without your love` - Initialize `my world` with the result of subtracting `your love` from 0

* `If the tears of a child is nothing` - check whether `the tears` * `a child` = 0 

* `My heart over the moon` - Returns `my heart` divided by `the moon`

#### Poetic Literals

Rockstar also supports a unique language feature known as **poetic literals**. Inspired by the [here-document](https://en.wikipedia.org/wiki/Here_document) syntax supported by many scripting languages, poetic literals allow the programmer to simultaneously initialize a variable and express their innermost angst.

##### Poetic Type Literals

A poetic type assignment is a single line consisting of a variable name, the `is` keyword, or the aliases `was` or `were`, and a Literal Word signifying the value the variable will be set to.

* `My heart is true` - initialises the variable `my heart` with the Boolean value `true` 
* `Tommy is nobody` - initialises the variable `Tommy` with the value `null` using the `nobody` alias
* `Tommy is mysterious` - initialises the variable `Tommy` with the value `mysterious`.

##### Poetic String Literals

A poetic string literal assignment starts with a variable name, followed by one of the keywords `says` followed by a single space. The rest of the line up to the `\n` terminator is treated as an unquoted string literal.

* `Peter says Hello San Francisco!\n` will initialise the variable `Peter` with the string literal `"Hello San Francisco!"`
* `San Francisco says Hello back\n` will initialise the variable `San Francisco` with the string literal `Hello back`

#### Poetic Number Literals

A poetic number literal begins with a variable name, followed by the keyword `is`, or the aliases `was` or `were`. As long as the next symbol is not a Literal Word, the rest of the line is treated as a decimal number in which the values of consecutive digits are given by the lengths of the subsequent barewords, up until the end of the line. To allow the digit zero, and to compensate for a lack of suitably rock'n'roll 1- and 2-letter words, word lengths are parsed modulo 10. A period (.) character denotes a decimal place. Other than the first period, any non-alphabetical characters are ignored.

* `Tommy was a lovestruck ladykiller` initialises `Tommy` with the value `100`
* `Sweet Lucy was a dancer` - initialises `Sweet Lucy` with the value 16
* `A killer is on the loose` - initialises `a killer` with the value 235.
* `My dreams were ice. A life unfulfilled; wakin' everybody up, taking booze and pills` - initialises `my dreams` with the value `3.1415926535`
* `Tommy was without` initialises `Tommy` with the value `7` because `without` is a Reserved Keyword, but not a Literal Word.
 * Note that poetic literals **can** include Reserved Keywords, as with `taking` in this example.
 * The semi-colon, comma, apostrophe and any other non-alphabetical characters are ignored.

### Comparison

Similar to the single-equals operator in Visual Basic and some scripting languages, the `is` keyword in Rockstar is interpreted differently depending whether it appears as part of a statement or as part of an expression. `isn't` is the logical negation of the `is` keyword.

Comparison in Rockstar can only be done within an expression.

* `Tommy is nobody` initialises the variable `Tommy` with the value `nobody`
* `If Tommy is nobody` - will execute the following block if, and only if, the variable `Tommy` is equal to `nobody`

The keyword `ain't` (which is reduced to `aint` by Rockstar) is an alias for `isn't`. This usage runs contrary to idiomatic English, where "Tommy isn't anybody", "Tommy ain't nobody" and "Tommy ain't not nobody" somehow mean exactly the same thing.

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

All logical operators are short circuiting. This means if by evaluating the first argument to the operator guarantees a result, the other argument is not evaluated. `false and 1 over 0` is `false` and does not produce an error for dividing by zero.

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

Equality comparisons (`is`, `ain't`, `is not`) are allowed between types if they are the same type or they can be compared by the rules below. Objects are checked by reference equality, all other types are checked by value equality.

Ordering comparisons (`is higher than`, `is lower than`, `is as high as`, and `is as low as`) are only allowed if the operands are both Numbers or both Strings or they are converted to such an arrangement according to the rules below. Numbers are compared as expected, Strings are compared lexicographically.

- \<Mysterious\> \<op\> Mysterious =\> Equal.
- \<Non-Mysterious\> \<op\> Mysterious =\> Non equal.
- String \<op\> Number =\> Convert the string to a number using base 10 with leading zeros ignored. If it fails, return false.
- String \<op\> Boolean =\> Convert the string to a boolean using all defined aliases.
- String \<op\> Null =\> Non equal.
- Number \<op\> Boolean =\> Convert number to boolean by "truthiness".
- Number \<op\> Null =\> Convert null to 0.
- Boolean \<op\> Null =\> Convert null to false.

##### Examples

- `"1" is 1` evaluates to true because `"1"` gets converted to the number `1`
- `"2" ain't Mysterious` evaluates to true because all types are non equal to mysterious, besides mysterious itself. 
- `"02" < "10"` is true because of the lexicographical comparison between `0` and `1` shows that the first string is less than the second string.
- `True < 10` is an error because `10` gets coerced into `True` due to the comparison with a boolean and there is no allowed ordering comparisons between booleans.

#### Increment and Decrement Operators

- \<op\> String =\> Error
- \<op\> Boolean =\> Invert Boolean
- \<op\> Null =\> Error
- \<op\> Mysterious =\> Error

#### Binary Operators

Conversions other than the listed are errors.

- String \<plus\> Number =\> Convert the number to a base-10 string, retaining all precision, but removing unnecessary digits. A leading zero is considered necessary for numbers with no whole part. eg. `00.1000` gets serialized to `0.1`
- String \<plus\> Boolean =\> Convert the boolean to `true` or `false`
- String \<plus\> Null =\> Convert the null to `null`
- String \<plus\> Mysterious =\> Convert the mysterious to `mysterious`
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

Functions are declared with a variable name followed by the `takes` keyword and a list of arguments separated by one of the following: `and` `,` `&` `, and` `'n'`

* `Multiply takes X and Y`
* `Search takes Needle and Haystack`

The function body is a list of statements with no separating blank lines. A blank line denotes the end of a function body. Functions in Rockstar always have a return value, indicated by the `Give back` keyword. 

Functions are called using the 'taking' keyword and must have at least one argument. Multiple arguments are separated with one of the following: `,` `&` `, and` `'n'`.

Arguments may only be variables or literals. Compound expressions are not allowed. Functionals are greedy, if they find more symbols that make up valid arguments they will take them.

* `Multiply taking 3, 5` is an expression returning (presumably) 15
* `Search taking "hands", "lay your hands on me"`
* `Put Multiply taking 3, 5, and 9 into Large` will set large to `3 * 5 * 9` **NOT** `(3 * 5) && 9`.
