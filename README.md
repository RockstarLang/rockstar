# rockstar2
It's time. Rockstar 2: "The Difficult Second Version"

The Build Process

Building codewithrockstar.com works like this:

build-and-test-rockstar-engine

- runs on Linux
- Builds the parser and interpreter
- Runs the test suite
- Uploads artifacts for:
	- linux native binary
	- WASM interpreter for the website

IF THAT WORKS:

build-windows-binary
* builds the Rockstar windows binary

build-macos-binary
* builds the macOS binary

 build-and-deploy-website
	* Downloads the linux binary Rockstar WASM artifact from step 1
	* Downloads the windows and macOS binaries from steps 2 and 3
	* Builds the Jekyll site
### Debug/Dev Mode Setup

In dev mode, I use symbolic directory links between the various parts of the project. Rebuilding the .NET solution will rebuild the WASM interpreter, which Jekyll can see as `/wasm/**`, and trigger a site rebuild, and all the Rockstar code examples are part of both the `Rockstar.Test` .NET test suite project and the `codewithrockstar.com` site:

```
> cd codewithrockstar.com
> mklink /d wasm ..\Starship\Rockstar.Wasm\bin\Debug\net8.0-browser
> mklink /d examples ..\Starship\Rockstar.Test\programs\examples
```

```
codewithrockstar.com
  /wasm --> [ /Starship/Rockstar.Wasm/bin/Debug/net8.0-browser ]
  /examples --> [ /Starship/Rockstar.Test/programs/examples ]
  /index.html
  /example.md
  /js
 	/rockstar-editor.js (from codemirror)
```


Function currying

```
output
  function call: product
    function call: sum
      number: 2
      number: 4
      function call: sum
        number: 5
        number: 6
```

So: `product(sum(2,4,sum(5,6))` needs to be translated to `product(sum(2,4),sum(5,6))` based on the arity of the functions

So `sum(2,4,sum(5,6))` needs to evaluate `sum(2,4)` and leave the expression `sum(5,6)` in the bucket

Then `product(sum(2,4)`