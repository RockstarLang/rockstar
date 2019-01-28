# How to contribute to Rockstar

> "Rockstar was never intended to be more than a joke - a parody spec that I threw together in a couple 
of hours in a bar one evening. The amount of interest and enthusiasm that this project has generated
has been astonishing, and wonderful, but – perhaps inevitably – there are a LOT of things in the initial Rockstar spec that 
made perfect sense when it was a joke spec but have proved incredibly difficult to actually implement.
>
> "Over the last six months, the entire Rockstar project has been through a sort of massive red/green/refactor cycle - 
> creating tests to validate core language features, building implementations that pass those tests, and then looking
> at ways to clean up and harmonise those implementations.
> 
> Thanks to the ongoing efforts of Rockstar developers around the world, we've ironed out most of the contradictions,
> resolved dozens of ambiguities and gotchas in the original spec, and come up with something that's probably good 
> enough to call a 'release candidate'. But I have a funny feeling like this is still only the beginning. :)
>
>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- @dylanbeattie, January 2019

## Ways you can contribute

First, make sure you've read the [code of conduct](CODE_OF_CONDUCT.md). TL;DR: be excellent to each other. Be calm, be 
kind, help make Rockstar a community where new faces feel welcome and old hands feel appreciated.

* Report a bug. If you've found something that doesn't work, let us know.
* Suggest a new feature.
* Write a great Rockstar program we can add to our examples
* Create your own implementation of Rockstar

### Reporting bugs

If you've found a bug in the specification or in the Satriani implementation, let us know about it.
* Search the [Issues](https://github.com/rockstarlang/rockstar/issues) to check we're not already tracking it.
* If you can't find an open issue that describes your problem, [open a new one](https://github.com/RockstarLang/rockstar/issues/new).
  * Include a **title and clear description**
  * Describe:
    * What you did (ideally with a code sample)
    * What you expected to happen
    * What actually happened, including any error messages or program output.

### Fixing Bugs

If you've fixed an open bug - awesome! You're a true Rockstar developer.
*  Open a new GitHub pull request with your patch. Pull requests should include:
   * The fix itself
   * One or more test cases in the form of `.rock` programs demonstrating the bug, that 
   should FAIL on an unpatched implementation and PASS with your patch in place.
   * Updates to any associated documentation or examples
 
### Contributing Features

If you've got a great idea for a Rockstar language feature, start by checking 
[issues](https://github.com/rockstarlang/rockstar/issues) to check we're not already tracking it, or that your idea
hasn't already been rejected.

If not, start by [opening an issue](https://github.com/RockstarLang/rockstar/issues/new) that describes your idea. If
you want to chat to some of the core team about it first, hop onto the 
[Rockstar Developers channel on Discord](https://discordapp.com/invite/xsQK7UU) and tell us what you're thinking.

Remember, a good Rockstar feature is one that extends the capabilities of the language *and* allows developers the
kind of lyrical creativity that makes for great Rockstar programs.  
                                                                       