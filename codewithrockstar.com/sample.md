---
title: Home
layout: page
nav_exclude: true
---


---
title: Markdown kitchen sink
nav_order: "9999"
layout: page
# nav_exclude: true
---

# Markdown kitchen sink

## FontAwesome

### Icons
  <i class="fa-solid fa-guitars"></i>
  <i class="fa-light fa-guitars"></i>
  <i class="fa-thin fa-guitars"></i>
  <i class="fa-regular fa-guitars"></i>

  <i class="fa-solid fa-saxophone"></i>
  <i class="fa-solid fa-piano"></i>
  <i class="fa-solid fa-hand-horns"></i>
  <i class="fa-regular fa-hand-horns"></i>
  <i class="fa-light fa-hand-horns"></i>
  <!-- uses solid style -->

### Animations

  <i class="fa-solid fa-sync fa-spin"></i>
  <i class="fa-solid fa-circle-notch fa-spin"></i>
  <i class="fa-solid fa-cog fa-spin"></i>
  <i class="fa-solid fa-cog fa-spin fa-spin-reverse"></i>
  <i class="fa-solid fa-spinner fa-spin-pulse"></i>
  <i class="fa-solid fa-spinner fa-spin-pulse fa-spin-reverse"></i>

  <i class="fa-solid fa-bell fa-shake"></i>
  <i class="fa-solid fa-lock fa-shake"></i>
  <i class="fa-solid fa-stopwatch fa-shake"></i>
  <i class="fa-solid fa-bomb fa-shake"></i>

  <i class="fa-solid fa-circle-plus fa-beat"></i>
  <i class="fa-solid fa-heart fa-beat"></i>
  <i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 0.5s;"></i>
  <i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 2s;"></i>
  <i class="fa-solid fa-heart fa-beat" style="--fa-beat-scale: 2.0;"></i>

The [kramdown GFM parser](https://github.com/kramdown/parser-gfm) `README` includes:
> By default, Jekyll uses the GitHub Flavored Markdown (GFM) processor for kramdown.
> At the moment this parser is based on the kramdown parser, with the following changes:
>
> - Support for fenced code blocks using three or more backticks has been added.
> - Hard line breaks in paragraphs are enforced by default (see option hard_wrap).
> - ATX headers need a whitespace character after the hash signs.
> - Strikethroughs can be created using two tildes surrounding a piece of text.
> - Blank lines between paragraphs and other block elements are not needed by default.
> - Render emojis used at GitHub.

See also the [kramdown documentation](https://kramdown.gettalong.org).

Text can be **bold**, _italic_, or ~~strikethrough~~.

[Link to another page](../../tests/index/).

There should be whitespace between paragraphs.

There should be whitespace between paragraphs. We recommend including a README, or a file with information about your project.

# Header 1

This is a normal paragraph following a header. GitHub is a code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.

## Header 2

> This is a blockquote following a header.
>
> When something is important enough, you do it even if the odds are not in your favor.

### Header 3

```js
// Javascript code with syntax highlighting.
var fun = function lang(l) {
  dateformat.i18n = require('./lang/' + l)
  return true;
}
```

```ruby
# Ruby code with syntax highlighting
GitHubPages::Dependencies.gems.each do |gem, version|
  s.add_dependency(gem, "= #{version}")
end
```

#### Header 4 `with code not transformed`

*   This is an unordered list following a header.
*   This is an unordered list following a header.
*   This is an unordered list following a header.

##### Header 5

1.  This is an ordered list following a header.
2.  This is an ordered list following a header.
3.  This is an ordered list following a header.

###### Header 6

[This is a very long link which wraps and therefore doesn't overflow
even when it comes at the beginning](.) of the line.

- [This is a very long link which wraps and therefore doesn't overflow the line
  when used first in an item ](.) in a list.

| head1        | head two          | three |
|:-------------|:------------------|:------|
| ok           | good swedish fish | nice  |
| out of stock | good and plenty   | nice  |
| ok           | good `oreos`      | hmm   |
| ok           | good `zoute` drop | yumm  |

### There's a horizontal rule below this.

* * *

### Here is an unordered list:

*   Item foo
*   Item bar
*   Item baz
*   Item zip

### And an ordered list:

1.  Item one
1.  Item two
1.  Item three
1.  Item four

### And an ordered list, continued:

1.  Item one
1.  Item two

Some text

{:style="counter-reset:none"}
1.  Item three
1.  Item four

### And an ordered list starting from 42:

{:style="counter-reset:step-counter 41"}
1.  Item 42
1.  Item 43
1.  Item 44

### And a nested list:

- level 1 item
  - level 2 item
  - level 2 item
	- level 3 item
	- level 3 item
- level 1 item
  - level 2 item
  - level 2 item
  - level 2 item
- level 1 item
  - level 2 item
  - level 2 item
- level 1 item

### Nesting an ol in ul in an ol

- level 1 item (ul)
  1. level 2 item (ol)
  1. level 2 item (ol)
	- level 3 item (ul)
	- level 3 item (ul)
- level 1 item (ul)
  1. level 2 item (ol)
  1. level 2 item (ol)
	- level 3 item (ul)
	- level 3 item (ul)
  1. level 4 item (ol)
  1. level 4 item (ol)
	- level 3 item (ul)
	- level 3 item (ul)
- level 1 item (ul)

### And a task list

- [ ] Hello, this is a TODO item
- [ ] Hello, this is another TODO item
- [x] Goodbye, this item is done

### Nesting task lists

- [ ] level 1 item (task)
   - [ ] level 2 item (task)
   - [ ] level 2 item (task)
- [ ] level 1 item (task)
- [ ] level 1 item (task)

### Nesting a ul in a task list

- [ ] level 1 item (task)
   - level 2 item (ul)
   - level 2 item (ul)
- [ ] level 1 item (task)
- [ ] level 1 item (task)

### Nesting a task list in a ul

- level 1 item (ul)
   - [ ] level 2 item (task)
   - [ ] level 2 item (task)
- level 1 item (ul)
- level 1 item (ul)

### Small image

![](../../assets/images/small-image.jpg)

### Large image

![](../../assets/images/large-image.jpg)

"[Wroclaw University Library digitizing rare archival texts](https://www.flickr.com/photos/97810305@N08/9401451269)" by [j_cadmus](https://www.flickr.com/photos/97810305@N08) is marked with [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/?ref=openverse).

### Labels

I'm a label
{: .label }

blue
{: .label .label-blue }
green
{: .label .label-green }
purple
{: .label .label-purple }
yellow
{: .label .label-yellow }
red
{: .label .label-red }

**bold**
{: .label }
*italic*
{: .label }
***bold + italic***
{: .label }

### Definition lists can be used with HTML syntax.

<dl>
<dt>Name</dt>
<dd>Godzilla</dd>
<dt>Born</dt>
<dd>1952</dd>
<dt>Birthplace</dt>
<dd>Japan</dd>
<dt>Color</dt>
<dd>Green</dd>
</dl>

#### Multiple description terms and values

Term
: Brief description of Term

Longer Term
: Longer description of Term,
  possibly more than one line

A longer term that requires a line break
: Longer description of Term,
  possibly more than one line

Term
: First description of Term,
  possibly more than one line

: Second description of Term,
  possibly more than one line

Term1
Term2
: Single description of Term1 and Term2,
  possibly more than one line

Term1
Term2
: First description of Term1 and Term2,
  possibly more than one line

: Second description of Term1 and Term2,
  possibly more than one line

### More code

```python{% raw %}
def dump_args(func):
	"This decorator dumps out the arguments passed to a function before calling it"
	argnames = func.func_code.co_varnames[:func.func_code.co_argcount]
	fname = func.func_name
	def echo_func(*args,**kwargs):
		print fname, ":", ', '.join(
			'%s=%r' % entry
			for entry in zip(argnames,args) + kwargs.items())
		return func(*args, **kwargs)
	return echo_func

@dump_args
def f1(a,b,c):
	print a + b + c

f1(1, 2, 3)

def precondition(precondition, use_conditions=DEFAULT_ON):
	return conditions(precondition, None, use_conditions)

def postcondition(postcondition, use_conditions=DEFAULT_ON):
	return conditions(None, postcondition, use_conditions)

class conditions(object):
	__slots__ = ('__precondition', '__postcondition')

	def __init__(self, pre, post, use_conditions=DEFAULT_ON):
		if not use_conditions:
			pre, post = None, None

		self.__precondition  = pre
		self.__postcondition = post
{% endraw %}```

```
Long, single-line code blocks should not wrap. They should horizontally scroll if they are too long. This line should be long enough to demonstrate this.
```

```
The final element.
```