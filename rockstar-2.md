# Rockstar 2

Rockstar was invented in a bar, as a joke. It was a parody spec. I thought people might read it, laugh, and move on. I didn't think anybody would implement it, and I certainly didn't think that more than five years later people would still be using it, creating their own implementations, and filing issues when they found inconsistencies in the spec.

Douglas Adams once said about Zaphod Beeblebrox that he gave the character two heads and three arms because on the radio that's a cheap throwaway gag... but when it came to adapting *The Hitch-Hikers Guide to the Galaxy* for television and film, that throwaway gag turned into an expensive nightmare for the production designers.

Bits of the original Rockstar spec were like that. `Take it to the top` as a `continue` statement was daft. Poetic literals were, and are, a lovely idea, but the way they were specified made a lot of other things unnecessarily difficult. Using `mysterious` to denote an uninitialised variable caused a few giggles and a lot of headaches.

**It's time for Rockstar 2.**

The fundamental premise of Rockstar remains the same: it's a language in which your computer programs can also be songs, so **every feature of the language** has to be expressible in a form that wouldn't look out of place in the lyrics to a rock song.

There is another really important consideration, though: Rockstar only exists because it's fun. It should be a fun language to use, and a fun language to maintain... and at some point, working around all the stupid hacks and throwaway gags in the original spec stopped being fun.

**That means there will be breaking changes.** Rockstar 1 programs probably won't run on Rockstar 2, and I have no intention to support a "legacy mode". Rockstar 2 will be a complete overhaul. Some programs might run with minimal modifications, but at this point I'm far more interested in the folks who might consider using it for the next Advent of Code than the folks who used it for the last one.

## So what's going to break?

### Poetic literals

Rockstar 1 used the `is` and `was` keywords to initialise a variable based on a poetic literal:

`Desire is a lovestruck ladykiller`

would initialise the variable `desire` to the value `100`. This was the only place in the language that allowed poetic literals - and meant the `is` keyword couldn't be used for ordinary  assignment. Rockstar 2 will introduce the keyword `like` to denote a poetic literal expression, and poetic literal expressions can be used anywhere. `Desire is like a lovestruck ladykiller` (initialise `Desire` with the value `100`)

`If your smile is like a sledgehammer` - a Boolean expression which is true if `your smile` is equal to `12`

This frees up `is` and `was` for assignment.

```
X is 5
Y is X
Z is X with Y
```

Poetic literals will use the ellipsis `...` (or the Unicode equivalent U+2026 `…`) as a decimal separator:

```rockstar
My dreams were like ice... a life unfulfilled, wakin' everybody up, taking booze and pills.
```

### Statements and block syntax.

In Rockstar 1, statements ended with a newline, and the only way to terminate a block was a blank line.

In Rockstar 2, a statement ends with a **new line** or a **terminal punctuation mark** `.`, `!`, `?`. (These are punctuation marks which would end a sentence in written English.) 

#### Line continuations

If the last non-whitespace character on a line is a **continuation punctuation mark** `-`, `,`, `;`, `.`, the subsequent newline is ignored. This allows Rockstar statements to span multiple lines:

```
My dreams were like ice... a life unfulfilled, 
wakin' everybody up, taking booze and pills.
```

```rockstar
My pain is like a diamond.
Until my pain is nothing, shout it, tear it down, yeah.
```

In Rockstar 2, the block terminators `whoa`, `oh`, `yeah`  and `baby` indicate the end of a code block. 

To end multiple nested blocks, you can use `ooh` (ends two blocks), `oooh` (three blocks), `ooooh` (ends four blocks), `yeeah`, `yeeeah`, `baaby`, `baaaaby`, `whooa`, `whoooa`. *(how easy is this to implement? I have literally no idea.)*

A block terminator includes **all adjacent whitespace and punctuation characters**. `, yeah!` is equivalent to `yeah`

```rockstar
Midnight takes your heart and your soul
While your heart is as high as your soul
Put your heart without your soul into your heart
Ooh, give back your heart, yeah.
```

Declaring functions

```rockstar
wants, takes, needs, craves, longs for

The sum takes w, x, y and z
Give back w with x with y with z

Search wants a needle and a haystack
(todo: implement search)
```

Calling functions

```
My heart is the sum taking 4, 5, 6 and 7
```

## The Rockstar Wishlist

### Better equality / comparisons

Truthiness and falsiness are a good idea most of the time. Decrementing a number until it's falsy (zero), chopping characters out of a string until it's falsy (empty string) - they're useful for writing lyrical code.

I propose the `exactly` keyword (alias `really`, `actually`)

```rockstar
My dreams are nothing
My heart is silence
If my heart is my dreams (returns true because 0 ~= "")
If my heart is really my dreams (returns false because 0 !== "")
```

### A native interpreter (rockstar.exe, /bin/rockstar)

For Rockstar 2.0, I'm porting the parser and interpreter to .NET. 

.NET 8 supports native ahead-of-time compilation for just about every platform out there - Windows, macOS, Linux, on both Intel and ARM architectures - as well as WebAssembly, so it should be possible to produce native binaries for folks who want to run Rockstar locally, and a WASM version which will replace the Satriani JS interpreter used on codewithrockstar.com

### An improved online editor and AST visualiser

When I was building Satriani, I used a hacky web app I built which rendered the parser output and syntax tree based on a grammar definition and program input. Something like this could be really useful for other folks writing and debugging Rockstar programs. Details TBC but it'll be cool.

### Better VS Code support

Syntax highlighting, an AST visualiser... anybody want to build a Rockstar language server? :)

*(Yes, this is a ridiculous amount of effort to put into a joke language... but programming is fun and I like building things.)*

### Filesystem and network IO

This one's always been a bit controversial because supporting any kind of filesystem or network access means implementing features that won't work in a web-based interpreter. Some sort of HTTP client might be a nice way to allow Rockstar to connect to external resources without tying it to any kind of filesystem.

Here's one possible syntax that might work:

```
The file is "input.txt"
Open the file (note that this replaces the variable: the file name is now a file handle)
Read the file into the line
Say "this is another line" into the file


```



### Modules, packages, imports, libraries... 

I'm still undecided as to whether we need this. Partly because, along with filesystems, it's a reasonable guarantee that people can't use Rockstar to build anything important.

But it's worth considering. As well as concerns around coupling Rockstar to specific filesystems, the big challenge with modules and imports is that I have no idea what the syntax for this might look like. 

One idea that I've had floating around for a while is to use the list of "musicians" as the imports and possessive apostrophes to denote namespacing.

**Minimalist:**

```
(math.rock)
Modulus takes x and y
While x is as high as y
put x without y into x
End
Give back x
End
```

```rockstar
(program.rock)
Math: M

The result is M's modulus taking 5 and 3
Shout the result
```

**Idiomatic:**

```
(vocals.rock)
Revenge takes your heart and your soul
While your heart is as high as your soul
Put your heart without your soul into your heart
Whoa, give back your heart, yeah
```

```rockstar
Vocals: Stevie
Guitar: Kelly 
Bass: Nik

Fire is like ice, hate is like water
My world is nothing
The answer is Stevie's revenge taking my world, fire
```

### Random numbers

Idea: the `shuffle` keyword. `Shuffle x` returns a random integer between zero and `x`. `Shuffle my array` randomises the array order in place; `shuffle my array into the result` leaves the `my array` intact and puts the shuffled version into `the result`

### The system clock

I think `now` returning the current UTC timestamp  JS new Date().valueOf())?

## The Silly Stuff

### Meat Loaf Conditionals

There is an [old suggestion on the Rockstar repo from jimbobbennett](https://github.com/RockstarLang/rockstar/issues/68):

> For `if` blocks, Rockstar should support Meatloaf syntax:
> `I would do <function> for <condition> But I won't do <another function>`
 This syntax would evaluate the `<condition>`, and if it is `true`, then call `<function>`, else it will call `<another function>`.

I have no plans to implement this one incredibly specific scenario.

But... wouldn't it be cool if some combination of structures and statements meant this was valid Rockstar?
### Bill & Ted

We should parse expression like:

```rockstar
That is totally non non non non non NON heinous
```

### Real songs as Rockstar programs ("Rock You Like A Hurricane")

I think that Scorpions' "[Rock You Like A Hurricane](https://www.google.com/search?q=scorpions+rock+you+like+a+hurricane+lyric)" is the best candidate for an actual rock song which will cleanly compile in Rockstar, and I'd like to see if I can implement new language features in such a way that the whole song is syntactically valid.
## Timeline

The [Copenhagen Developers Festival](https://cphdevfest.com/) is happening in August. It's a great event -- a mashup of a software developer conference and a music festival -- and sounds like a great excuse to throw a Rockstar 2.0 launch party.

Time to get to work.

### Developer Diary

Keywords with spaces in them.

OK, this is going to cause all kinds of fun.

Here are two expressions:

```
x is greater than y
x is y is greater than z
```

The first parses to:

```
binary:
	op: greater_than
	lhs: x
	rhs: y
```

The second to:

```
binary:
	op: equality
	lhs: x
	rhs: binary
		op: greater_than
		lhs: y
		rhs: z
```

## Types vs Expressions

#### Option 1: Number : Type : Expression

Pros:
* No repetition - there is only one thing called Number
* Parser captures literals as actual types

Cons:

* Results of evaluations will have empty line/column/lexeme (is this bad?)
	* what if we replace this with a Source property that tells us where it came from?
	* If Source is null - it didn't come from source code
#### Option 2: Number Type AND Number Expression

Pros: 

* Type doesn't contain any unnecessary metadata
* Eval() returns a Type, not an Expression
	* so Eval() will ALWAYS result in a Number/String/Boolean/Symbol/Function/Reference?
	* ...but this still works even if Type : Expression




x is 5
y is 7
the total is x with y

# Breaking changes
Stuff that works differently in rockstar 2.0

* Boolean operators now behave like JavaScript: `true && x` will return x, `false || foo` will return foo
* 

CONDITIONALS

"foo" = !"bar"    
"foo" != "bar" => true

a = !b
a != b

