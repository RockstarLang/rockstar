---
title: Flow Control
layout: docs
examples: /examples/07-flow-control/
nav_order: "1006"
summary: If, else, otherwise, loops, until, while... and how to end a block, oooh, yeah, baby.
---
## Conditionals: If / Else

Consider this instruction:

> Go to the store. If they have oranges, get a dozen, then get some bagels.

If the store doesn't have oranges, should you still get bagels?

C-style languages resolve this using braces and block syntax:

```c
if (they have oranges) {
	get a dozen
}
get some bagels
```
compared with:
```c
if (they have oranges) {
	get a dozen
	get some bagels
}
```

Rockstar doesn't have curly braces, because you can't sing curly braces, so Rockstar has to use some syntactic tricks to resolve these kinds of ambiguities.

If statements can be one-liners, or conditional blocks.
### One-line if

One-line if statements don't create any block scope. However many `if` statements you stack on the same line, the final statement on the line either runs or it doesn't, and then you're done:

{% rockstar_include if-else-oneliners.rock %}

### Multiline conditionals

Multiline conditionals are a little more complex, because they can create nested scopes. Here's an example which uses some very un-Rockstar indentation to keep track of scope:

{% rockstar_include indented-if.rock %}

If the condition or the `else` keyword is followed by a new line, it begins a new **block**. A block is a series of statements separated by statement separators (newlines or punctuation `.!?;`). The end of a block is denoted by:

* An empty line (a line containing only whitespace and/or comments)
* The `end` keyword or any of its aliases `oh`, `yeah` or `baby` -- see below.
* The `else` or `otherwise` keywords implicitly end the current block and start the alternate block for the current `if`.

The end of file (EOF) will implicitly close any open blocks. This isn't Lisp, folks. The parser knows what you mean.
## This is the end, oh yeah, baby

Consider this example from a C-like language:
```c
if (x) {
	if (y) {
		if (z {
			print "this might get printed"
		}
	}
}
print "this always gets printed"
```

Before the final line, we need to close three blocks, so we use three closing braces -- `} } }`.

Languages like Python that use indentation to control scope don't have this problem: indenting creates a block, and if you drop a level of indentation, the block's over.

Rock lyrics don't have curly braces, and they don't have indentation. To end a block, you can use the keyword `end`:

{% rockstar_include oh-yeah-baby-minimalist.rock %}

Singing `end end end` doesn't sound very rock'n'roll, so Rockstar also supports the aliases `oh`, `yeah` and `baby` - because it turns out you can get away with repeating that stuff almost *ad infinitum* and it just sounds like song lyrics. The Corrs' "So Young" opens with the line "yeah, yeah, yeah, yeah, yeah", Whitesnake's "The Deeper The Love" has a "baby baby baby", and if you throw in the odd "oh, yeah baby, yeah yeah yeah" you can close half-a-dozen nested blocks and nobody's going to notice except the Rockstar parser.

{% rockstar_include oh-yeah-baby-idiomatic.rock %}
### Oooooh

You can also close as many blocks as you need to by using Rockstar's `oooh` keyword. This closes one block for every letter `o` -- so `oh` closes one block, `ooh` closes two blocks, `oooh` closes three blocks, and so on. You can also combine `oooh` with other keywords, so that `oooh yeah baby` will close five blocks, and if there's a blank line immediately after it, that'll close a sixth block.

{% rockstar_include ooooh.rock %}

### Loops: While and Until

Loops are denoted by the `while` and `until` keywords.

{% rockstar_include while.rock %}

{% rockstar_include until.rock %}

Nested loops create block scope: as with `if` statements, you must end the block with a newline, `end`, `yeah`, `baby`, and you can end one or more blocks using the `oooh` syntax:

{% rockstar_include nested-loops.rock %}

 To break out of a loop, use the `break` keyword.

{% rockstar_include break.rock %}

To skip the rest of the current loop and start the next iteration, use the `continue` keyword:

{% rockstar_include continue.rock %}

`break` and `continue` are **wildcard keywords** - everything between the keyword and the next end-of-statement is ignored, so the following are all equivalent:

```
break it down
break my heart
break on through to the other side
```

{% rockstar_include break-and-continue-wildcard.rock %}





