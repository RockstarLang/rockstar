# Rockstar

Rockstar is a dynamically-typed Turing-complete programming language. 

Rockstar is designed for creating computer programs that are also song lyrics, and is heavily influenced by the lyrical conventions of 1980s hard rock and power ballads.

### But why?

Mainly because if we make Rockstar a real (and completely pointless) programming language, then recruiters and hiring managers won't be able to talk about 'rockstar developers' any more.

Also 'cos it's kinda fun and any language based on the idea of compiling Meatloaf lyrics has to be worth a look, right?

Also we can make stickers. Who doesn't want a sticker on their laptop saying 'CERTIFIED ROCKSTAR DEVELOPER'?

## The Rockstar Language Specification

Rockstar is intended to give the programmer an unprecedented degree of poetic license when it comes to the composition and structure of their programs. 

### Variables

There's two ways to declare and use variables in Rockstar. 

**Common variables** consist of one of the keywords `the`, `my` or `your` followed by a unique variable name, which must contain only lowercase ASCII letters a-z. 

**Proper variables** are proper nouns - any word that isn't a reserved keyword and starts with an uppercase letter. Proper variable names can contain spaces as long as each space is followed by an uppercase letter. Whilst some developers may use this feature to create variables with names like `Customer ID`, `Tax Rate` or `Distance In KM`, we recommend you favour idiomatic variable names such as `Tommy`, `Gina`, `Roxanne`, `Layla`, `Black Betty`, `Billie Jean` and `Eleanor Rigby`.

As in Ruby, Python and VBScript, variables are dynamically and you don't need to declare variables before use.

**Pronouns**

The keywords `it`, `he`, `she`, `him`, `her`, `them`, `they` always refer to the most recently named variable, determined at parse time. 

### Types

Rockstar uses a very similar type system to that defined by the [ECMAScript type system](http://www.ecma-international.org/ecma-262/5.1/#sec-8), except `undefined` doesn't sound very rock'n'roll so we use `mysterious` instead.

* **Mysterious** - the value of any variable that hasn't been assigned a value, denoted by the keyword `mysterious`
* **Null** - the null type. Evaluates as equal to zero and equal to false. The keywords `nothing`, `nowhere` and `nobody` are defined as aliases for `null`
* **Boolean** - a logical entity having two values `true` and `false`. *(The keywords `maybe` and `definitely maybe` are reserved for future use)*
* **Number** - Numbers in Rockstar are stored using the [DEC64](http://www.dec64.com/) numeric type.
* **String** - Rockstar strings are sequences of 16-bit unsigned integer values representing UTF-16 code points.
* **Object** - a collection of named data properties, as in ECMAScript.
		

### Literals and Assignment

String literals in Rockstar use single or double quotes interchangably. 

* `"Hello World"`
* `'This is a string'`

Numeric literals in Rockstar are written as decimal numbers

* `123`
* `3.141592654`

Assignment is denoted by the `put/into` keyword combination:

* `Put 123 into X` will assign the value `123` to the variable `X`
* `Put 'Hello World' into the message` will assign the value `'Hello World'` to the variable `the message`

#### Increment and Decrement

Increment and decrement are supported by the `Build {variable} up` and `Knock {variable} down` keywords.

* `Build my world up` will increment the value stored in `my world` by 1.
* `Knock the walls down` will decrement the value stored in `the walls` by 1
 
#### Poetic Literals

Rockstar also supports a unique language feature known as **poetic literals**. Inspired by the [here-document](https://en.wikipedia.org/wiki/Here_document) syntax supported by many scripting languages, poetic literals allow the programmer to simultaneously initialize a variable and express their innermost angst.

##### Poetic Type Literals

For the keywords `true`, `false`, `nothing`, `nobody` and `nowhere`, a poetic assignment is a single line consisting of a variable name, the `is` keyword and the required value literal

* `My heart is true` - initialises the variable `my heart` with the Boolean value `true` 
* `Tommy is nobody` - initialises the variable `Tommy` with the value `null` using the `nobody` alias

##### Poetic String Literals

A poetic string literal assignment starts with a variable name, followed by one of the keywords `says` followed by a single space. The rest of the line up to the `\n` terminator is treated as an unquoted string literal.

* `Billy says hello world!\n` will initialise the variable `Billy` with the string literal `"hello world!"`
* `The world says hello back\n` will initialise the variable `the world` with the string literal `hello back`

#### Poetic Number Literals

A poetic number literal begins with a variable name, followed by one of the keywords `is` or the aliases `was` or `were`. As long as the next symbol is not a reserved keyword, the rest of the line is treated as a decimal number in which the values of consecutive digits are given by the lengths of the subsequent barewords, up until the end of the line. To allow the digit zero, and to compensate for a lack of suitably rock'n'roll 1- and 2-letter words, word lengths are parsed modulo 10. A period (.) character denotes a decimal place. Other than the first period, any non-alphabetical characters are ignored.

* `Tommy was a lovestruck ladykiller` initialises `Tommy` with the value `100`
* `Sweet Lucy was a dancer` - initialises `Sweet Lucy` with the value 16
* `My dreams were ice. A life unfulfilled; wakin' everybody up, taking booze and pills` - initialises `my dreams` with the value `3.1415926535'

### Comparison

Similar to the single-equals operator in Visual Basic and some scripting languages, the `is` keyword in Rockstar is interepreted differently depending whether it appears as part of a statement or as part of an expression.

Comparison in Rockstar can only be done within an expression.

* `Tommy is nobody` initialises the variable `Tommy` with the value `nobody`
* `If Tommy is nobody then` - will execute the next line if, and only if, the variable `Tommy` is equal to `nobody`

The modifier `not`  will invert the meaning of the comparison, similar to `IS NULL / IS NOT NULL` in SQL. The keyword `ain't` is an alias for `is not`. This usage runs contrary to idiomatic English, where "Tommy isn't anybody", "Tommy ain't nobody" and "Tommy ain't not nobody" somehow mean exactly the same thing.

Rockstar also supports the comparison syntax `is {comparator} than`, where `{comparator}` is defined as one of the keywords `higher`, `greater`, `bigger` or `stronger` to denote 'greater than', and the keywords `lower`, `less`, `smaller` and `weaker` to denote 'less than'. 
 
### Input/Output

Use the `Listen` keyword to read one line of input from STDIN. Use `Listen to` to capture the input into a named variable.

* `Listen to your heart` - read one line of input from `STDIN` and store it in `your heart`

Use the `Say` keyword to write the value of a variable to `SDTOUT`.

* `Say Tommy` - will output the value stored in `Tommy` to `STDOUT`
 
Rockstar defines `Shout`, `Whisper` and `Scream` as aliases for `Say`
 
### Flow Control and Block Syntax

#### Conditionals

Conditional expressions start with the `If` keyword, followed by an expression. If the expression evaluates to `true`, then the subsequent code block is executed.

#### Loops

Similar to the `If` statement, a loop is denoted by the `While` or `Until` keyword, which will cause the subsequent code block to be executed repeatedly whilst the expression is satisfied:

```
Tommy was a dancer
While Tommy ain't nothing,
Knock down Tommy
And around we go
```

That'll initialize Tommy with the value 16 (using the poetic number literal syntax) and then loop, decrementing Tommy by 1 each time until Tommy equals zero (i.e `ain't nothing` returns false).


The `break` and `continue` statements work as they do in most block-based languages. Rockstar defines `Break it down!` as an alias for `break` and `Take it to the top` as an alias for `continue` 

#### Blocks

A block of statements in Rockstar is denoted by the `and` keyword at the start of a line. Any line beginning with `and` forms part of a block statement continuing the previous line. The block ends when we hit a statement that doesn't start with `and`

```
Tommy was a dancer
While Tommy ain't nothing
Shout it
Knock it down
And around we go
```

### Functions

Functions are declared with a variable name followed by the `takes` keyword and a list of argument separated by the `and` keyword. 

* `Multiply takes X and Y`
* `Search takes Needle and Haystack`

The function body is a list of statements with no separating blank lines. A blank line denotes the end of a function body. Functions in Rockstar always have a return value, indicated by the `Give back` keyword. 

Functions are called using the 'taking' keyword:

* `Multiply taking 3, 5` is an expression returning (presumably) 15
* `Search taking "hands", "lay your hands on me"`

## Examples

Here's FizzBuzz in minimalist Rockstar, with block scope indented for clarity:

```
Modulus takes Number and Divisor
While Number is higher than Divisor
Take Divisor from Number
Give back Number

Limit is 100
Counter is 0
Fizz is 3
Buzz is 5
Until Counter is Limit
	Build Counter up
	If Modulus taking Counter, Fizz is 0 and Modulus taking Counter, Buzz is 0
		Say "FizzBuzz!"
		And Continue
	If Modulus taking Counter and Fizz is 0
		Say "Fizz!"
		And Continue
	If Modulus taking Counter and Buzz is 0
		Say "Buzz!"
		And Continue
	Say Counter
End
```

And here's the same thing in idiomatic Rockstar, using poetic literals and no indentation

```
Midnight takes your heart and your soul
While your heart is higher than your soul
Take your soul from your heart
Give back your heart

Desire is a lovestruck ladykiller
My world is nothing 
Fire is ice
Hate is water
Until my world is Desire,
Build my world up
If Midnight taking Desire, Fire is nothing and Midnight taking Desire, Hate is nothing
Shout "FizzBuzz!"
And take it to the top
If Midnight taking Desire, Fire is nothing
Shout "Fizz!"
And take it to the top
If Midnight taking Desire, Hate is nothing
Say "Buzz!"
And take it to the top
Whisper my world
And around we go
```

## Ideas

* Work out if this is even remotely implementable. I'm not sold on the idea of continuation prefixes for block syntax - for starters it won't let you implement nested blocks.
* Explore other ideas for Turing-complete rock ballad compilers. Maybe something based on BF where we use word length or initial letters or something to compile lyrics down to BF or some other very minimalist but Turing-complete language
* Make 'Certified Rockstar Developer' stickers and give them out to anybody who can write even one line of Rockstar.
