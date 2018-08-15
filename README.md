# UPDATE 2018-07-31 
**Hey rockstar developers.** 

**So...  this thing has completely exploded. 3,000+ stars, half-a-dozen implementations, loads of issues and ideas and PRs. It is AMAZING and you are all wonderful.**
**Only problem is... I'm in the middle of moving house right now so I'm going to have to put the whole thing on hold for a week or two.** 
**Doesn't mean it's dead - there's loads of really cool stuff still to come. But please, hang in there for a couple of weeks whilst I pack my life into a few dozen small boxes and lug it halfway across London.**

By all means keep filing issues and opening PRs. But don't get discouraged if they don't get an immediate response.

Rock on. \m/

_@dylanbeattie_

# Rockstar

Rockstar is a dynamically typed Turing-complete programming language. 

Rockstar is designed for creating computer programs that are also song lyrics, and is heavily influenced by the lyrical conventions of 1980s hard rock and power ballads.

### But why?

Mainly because if we make Rockstar a real (and completely pointless) programming language, then recruiters and hiring managers won't be able to talk about 'rockstar developers' any more.

Also 'cos it's kinda fun and any language based on the idea of compiling Meatloaf lyrics has to be worth a look, right?

Also we can make stickers. Who doesn't want a sticker on their laptop saying 'CERTIFIED ROCKSTAR DEVELOPER'?

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

**Common variables** consist of one of the keywords `a`, `an`, `the`, `my` or `your` followed by a unique variable name, which must contain only lowercase ASCII letters a-z. 

**Proper variables** are proper nouns - any word that isn't a reserved keyword and starts with an uppercase letter. Proper variable names can contain spaces as long as each space is followed by an uppercase letter. Whilst some developers may use this feature to create variables with names like `Customer ID`, `Tax Rate` or `Distance In KM`, we recommend you favour idiomatic variable names such as `Tommy`, `Gina`, `Doctor Feelgood`, `Mister Crowley`, `Kayleigh`, `Tom Sawyer`, `Billie Jean` and `Janie`. 

(Although not strictly idiomatic, `Eleanor Rigby`, `Peggy Sue`, `Black Betty`, `Layla` and `Johnny B Goode` would also all be valid variable names in Rockstar.)

As in Ruby, Python and VBScript, variables are dynamically typed and you don't need to declare variables before use.

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
* **Number** - Numbers in Rockstar are stored using the [DEC64](http://www.dec64.com/) numeric type.
* **String** - Rockstar strings are sequences of 16-bit unsigned integer values representing UTF-16 code units.
* **Object** - a collection of named data properties, as in ECMAScript.
		
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

Increment and decrement are supported by the `Build {variable} up` and `Knock {variable} down` keywords.

* `Build my world up` will increment the value stored in `my world` by 1.
* `Knock the walls down` will decrement the value stored in `the walls` by 1
 
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

* `Put nothing without your love into my world` - Initialize `my world` with the result of subtracting `your love` from 0

* `If the tears of a child is nothing` - check whether `the tears` * `a child` = 0 

* `My heart over the moon` - Returns `my heart` divided by `the moon`

#### Poetic Literals

Rockstar also supports a unique language feature known as **poetic literals**. Inspired by the [here-document](https://en.wikipedia.org/wiki/Here_document) syntax supported by many scripting languages, poetic literals allow the programmer to simultaneously initialize a variable and express their innermost angst.

##### Poetic Type Literals

For the keywords `true`, `false`, `nothing`, `nobody` and `nowhere`, a poetic assignment is a single line consisting of a variable name, the `is` keyword and the required value literal

* `My heart is true` - initialises the variable `my heart` with the Boolean value `true` 
* `Tommy is nobody` - initialises the variable `Tommy` with the value `null` using the `nobody` alias

##### Poetic String Literals

A poetic string literal assignment starts with a variable name, followed by one of the keywords `says` followed by a single space. The rest of the line up to the `\n` terminator is treated as an unquoted string literal.

* `Peter says Hello San Francisco!\n` will initialise the variable `Peter` with the string literal `"Hello San Francisco!"`
* `San Francisco says Hello back\n` will initialise the variable `San Francisco` with the string literal `Hello back`

#### Poetic Number Literals

A poetic number literal begins with a variable name, followed by the keyword `is`, or the aliases `was` or `were`. As long as the next symbol is not a reserved keyword, the rest of the line is treated as a decimal number in which the values of consecutive digits are given by the lengths of the subsequent barewords, up until the end of the line. To allow the digit zero, and to compensate for a lack of suitably rock'n'roll 1- and 2-letter words, word lengths are parsed modulo 10. A period (.) character denotes a decimal place. Other than the first period, any non-alphabetical characters are ignored.

* `Tommy was a lovestruck ladykiller` initialises `Tommy` with the value `100`
* `Sweet Lucy was a dancer` - initialises `Sweet Lucy` with the value 16
* `A killer is on the loose` - initialises `a killer` with the value 235.
* `My dreams were ice. A life unfulfilled; wakin' everybody up, taking booze and pills` - initialises `my dreams` with the value `3.1415926535`
 * Note that poetic literals **can** include reserved keywords, as with `taking` in this example.
 * The semi-colon, comma, apostrophe and any other non-alphabetical characters are ignored.

### Comparison

Similar to the single-equals operator in Visual Basic and some scripting languages, the `is` keyword in Rockstar is interepreted differently depending whether it appears as part of a statement or as part of an expression.

Comparison in Rockstar can only be done within an expression.

* `Tommy is nobody` initialises the variable `Tommy` with the value `nobody`
* `If Tommy is nobody` - will execute the following block if, and only if, the variable `Tommy` is equal to `nobody`

The modifier `not`  will invert the meaning of the comparison, similar to `IS NULL / IS NOT NULL` in SQL. The keyword `ain't` (which is reduced to `aint` by Rockstar) is an alias for `is not`. This usage runs contrary to idiomatic English, where "Tommy isn't anybody", "Tommy ain't nobody" and "Tommy ain't not nobody" somehow mean exactly the same thing.

Rockstar also supports the following comparison syntax:

* `is higher/greater/bigger/stronger than` to denote 'greater than'
* `is lower/less/smaller/weaker than` to denote 'less than'
* `is as high/great/big/strong as` to denote 'greater than or equal to'
* `is as low/little/small/weak as` to denote 'less than or equal to'

### Input/Output

Use the `Listen` keyword to read one line of input from `STDIN`. Use `Listen to` to capture the input into a named variable.

* `Listen to your heart` - read one line of input from `STDIN` and store it in `your heart`

Use the `Say` keyword to write the value of a variable to `STDOUT`.

* `Say Tommy` - will output the value stored in `Tommy` to `STDOUT`
 
Rockstar defines `Shout`, `Whisper` and `Scream` as aliases for `Say`
 
### Flow Control and Block Syntax

#### Conditionals

Conditional expressions start with the `If` keyword, followed by an expression. If the expression evaluates to `true`, then the subsequent code block is executed. Optionally, an `Else` block can be written after an `If` block. The code block following the `Else` keyword would be executed if the `If` expression evaluated to `false`.

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
While Number is as high as Divisor
Put Number minus Divisor into Number
    (blank line ending While block)
Give back Number
    (blank line ending function declaration)
Limit is 100
Counter is 0
Fizz is 3
Buzz is 5
Until Counter is Limit
Build Counter up
If Modulus taking Counter, Fizz is 0 and Modulus taking Counter, Buzz is 0
Say "FizzBuzz!"
Continue
    (blank line ending 'If' Block)
If Modulus taking Counter and Fizz is 0
Say "Fizz!"
Continue
    (blank line ending 'If' Block)	
If Modulus taking Counter and Buzz is 0
Say "Buzz!"
Continue
    (blank line ending 'If' Block)
Say Counter
    (EOL ending Until block)
```

And here's the same thing in idiomatic Rockstar, using poetic literals and no indentation

```
Midnight takes your heart and your soul
While your heart is as high as your soul
Put your heart without your soul into your heart

Give back your heart


Desire is a lovestruck ladykiller
My world is nothing 
Fire is ice
Hate is water
Until my world is Desire,
Build my world up
If Midnight taking my world, Fire is nothing and Midnight taking my world, Hate is nothing
Shout "FizzBuzz!"
Take it to the top

If Midnight taking my world, Fire is nothing
Shout "Fizz!"
Take it to the top

If Midnight taking my world, Hate is nothing
Say "Buzz!"
Take it to the top

Whisper my world
```

## Ideas

* Work out if this is even remotely implementable. I'm not sold on the idea of continuation prefixes for block syntax - for starters it won't let you implement nested blocks.
* Explore other ideas for Turing-complete rock ballad compilers. Maybe something based on BF where we use word length or initial letters or something to compile lyrics down to BF or some other very minimalist but Turing-complete language
* Make 'Certified Rockstar Developer' stickers and give them out to anybody who can write even one line of Rockstar.
* Generate a score for the lyrics using a component called a `composer`.

# Implementations

* [rockstar-js](https://github.com/wolfgang42/rockstar-js) - Rockstar-to-JavaScript transpiler
* [rockstar-lexer](https://github.com/aitorres/rockstar-lexer) - Rockstar lexer written in Haskell with Alex
* [rockstar-java](https://github.com/nbrevu/rockstar-java) - Rockstar interpreter in Java
* [rockstar-ml](https://github.com/lkwq007/rockstar-ml) - Rockstar interpreter in OCaml
* [rockstar-py](https://github.com/yanorestes/rockstar-py) - Rockstar-to-Python transpiler
* [kaiser-ruby](https://github.com/marcinruszkiewicz/kaiser-ruby) - Rockstar to Ruby transpiler
* [sublime-rockstar-syntax](https://github.com/paxromana96/sublime-rockstar-syntax) - Syntax highlighter for Sublime Text 3
* [language-rockstar](https://github.com/thestd/language-rockstar) - Syntax highlighter for Atom
* [maiden](https://github.com/palfrey/maiden) - Rockstar interpreter in Rust
* [rockstar-webpiler](https://github.com/cwfitzgerald/rockstar-webpiler) - Online Rockstar Parser and Transpiler. [rockstar.connorwfitzgerald.com](https://rockstar.connorwfitzgerald.com)
* [vim-rockstar](https://github.com/sirosen/vim-rockstar) - Syntax highlighting for vim
* [vscode-rockstar-language](https://github.com/ra100/vscode-rockstar-language) - Syntax highlighting for VSCode

# Social Spaces

* [/r/RockstarDevs](https://www.reddit.com/r/RockstarDevs/) - Subreddit
* [Rockstar Developers](https://discordapp.com/invite/xsQK7UU) - Discord Group

