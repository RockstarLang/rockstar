# Satriani

Satriani is a JavaScript interpreter for the Rockstar programming language. Satriani has been created to act as a reference implementation for managing changes to the Rockstar language specification.

## Usage

To run Satriani using nodeJS from the command line:
```
git clone https://github.com/RockstarLang/rockstar 
cd rockstar/satriani
yarn install
yarn pegjs
node rockstar <program>.rock
```

To run the test suite:

```
git clone https://github.com/RockstarLang/rockstar 
cd rockstar/satriani
yarn test
```

To run Satriani from your own JavaScript code:

```
const satriani = require('./satriani.js');

// Required to support reading from stdin
const readlineSync = require('readline-sync');

let rockstar = new satriani.Interpreter();
let program = "Shout Hello World!\nGive back 1\n";
let ast = rockstar.parse(program);

// Draw the abstract syntax tree (AST) to the console as a JSON object
console.log(JSON.stringify(ast, null, 2))

let output = console.log
let input = readlineSync.question
let result = rockstar.run(ast, input, output)
console.log(result);
```

To run Satriani in a browser, use `browserify` to bundle it:

```
git clone https://github.com/RockstarLang/rockstar 
cd rockstar/satriani
yarn browserify
```

This will create a single JS file, `satriani.standalone.js`, containing the Satriani parser and interpreter, which
you can use in web pages:

```
<!DOCTYPE html>
<html>
<body>

<script type="text/javascript" src="js/satriani.standalone.js"></script>
<script type="text/javascript">
    let source = 'Shout "Hello World"';
    let output = console.log;
    let input = () => window.prompt('Rockstar:');
    let rockstar = new Satriani.Interpreter(output);
    let result = rockstar.run(source, input, output);
    console.log(result);
</script>
</body>
</html>
```
## How it works

Satriani uses `pegjs`, a parser generator for JavaScript. The language 
grammar is defined in **[rockstar.peg](rockstar.peg)**.

We use the `pegjs` command line to generate `rockstar.parser.js`, which is the parser itself:

```
$ pegjs -o rockstar.parser.js rockstar.peg
```

This is also defined as a yarn build task, so you can build the parser using:

```
$ yarn run pegjs
```

**[rockstar.parser.js](rockstar.parser.js)** exports a function `parse(input, options)`, where `input` 
is a string containing the source code of your Rockstar program and `options` is the 
optional [pegjs parser options](https://pegjs.org/documentation#using-the-parser).

`parse` will return an **abstract syntax tree** (AST) containing your program. The 
AST is a JSON object representing your program as a tree of operations.

**[rockstar.interpreter.js](satriani.interpreter.js)** is a runtime interpreter that can take the AST created by the parser and evaluate it. It's pluggable
so you can override the I/O mechanisms.

The test suite is runnable using [Mocha](https://mochajs.org/) - each 'test' is defined as a .rock source file and an .rock.out output file, so the test suite is completely platform-agnostic.

## Acknowledgements

I've basically had to teach myself how to build compilers again to create this - it's been a long, long time since University... :)

HUGE thanks to Wolfgang Faust for https://github.com/wolfgang42/rockstar-js - I've been using his grammar
as a reference throughout and have reused bits of it directly, and it's been invaluable.

Mihai Bazon's fantastic series of articles on building recursive descent compilers in JavaScript has also been
really useful: http://lisperator.net/pltut/








