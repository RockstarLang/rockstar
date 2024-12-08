# Do you wanna get rocked?

This is Rockstar, an esoteric programming language whose syntax is inspired by the lyrics to 80s hard rock and heavy metal songs.

![[rockstar-logo-strapline-sticker.png]]
# What's Here

Rockstar has three main components:

* `/Starship` contains the Starship interpreter for Rockstar, built in C# and .NET
* `/cm-lang-rockstar` contains the CodeMirror editor used on the Rockstar website
* `/codewithrockstar.com` contains the Rockstar website, docs and examples

### Building Rockstar

To build the Starship engine, you'll need the .NET 9 SDK

```dotnetcli
dotnet build ./Starship/Starship.sln
dotnet test ./Starship/
```

The `codewithrockstar.com` website is built with Jekyll and hosted on GitHub Pages.

The embedded Rockstar interpreter is the Starship engine compiled to run on web assembly:

```dotnetcli
dotnet build ./Starship/Starship.sln
dotnet publish ./Starship/Rockstar.Wasm -o codewithrockstar.com/wasm/ -c Debug
```

### Building with GitHub Actions

Building codewithrockstar.com works like this:

**build-rockstar-2.0**
- runs on Linux
- Builds the parser and interpreter
- Runs the test suite
- Uploads artifacts for:
	- Linux native binary
	- WASM interpreter for the website

**build-windows-binary**
* builds the Rockstar windows binary

**build-macos-binary**
* builds the macOS binary

**release-rockstar-engine**
* creates the GitHub release from the latest binaries

 **build-and-deploy-website**
* Downloads the Rockstar WASM binary
* builds the CodeMirror editor
* Builds the Jekyll site
* Deploys the site to GitHub Pages
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

