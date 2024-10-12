```
program = head:statement EOL+ tail:program
	{ return [ head ].concat(tail) }
	/ head:statement
    	{ return [ head ] }
   / EOF { return [] }

block
	= _ head:statement EOS tail:block
    	{ return [ head ].concat(tail) }
    / _ head:statement 
    	{ return [ head ] }        

EOB = 
	EOS* &(_ 'otherwise')
    / EOS* _ 'end'

conditional 
	= 'if' _ d:digit EOL c:block EOB _ 'otherwise' EOL a:block EOB
		{ return { if: d, then: c, else: a } }        
	/ 'if' _ d:digit EOL c:block EOB
		{ return { if: d, then: c } }
	/ 'if' _ d:digit _ c:statement _ 'otherwise' _ a:statement
		{ return { if: d, then: c, else: a } }
    / 'if' _ d:digit _ c:statement
		{ return { if: d, then: c } }

statement =
	conditional    
    / 'say' _ d:digit { return "say " + d }

EOS = _ [.?!;]
	/ EOL

digit = $([0-9]+)
EOL = _ '\r'? '\n'
_ = [ \t]*
EOF = EOL* _!.
	
```

```
if 1
  if 2
    if 3
	    say 3
    otherwise
    	say 2
  otherwise 
    say 1
  end
end

```


And then there's this:

```
program = head:statement EOL+ tail:program
	{ return [ head ].concat(tail) }
	/ head:statement
    	{ return [ head ] }
   / EOF { return [] }

block
	= _ head:statement EOS tail:block
    	{ return [ head ].concat(tail) }
    / _ head:statement 
    	{ return [ head ] }        

EOB = 
	EOL &EOL
    / EOS* &(_ 'otherwise')
    / EOS* _ 'end'    

conditional 
	= 'if' _ d:digit EOL c:block EOB _ 'otherwise' EOL a:block EOB
		{ return { if: d, then: c, else: a } }        
	/ 'if' _ d:digit EOL c:block EOB _ 'otherwise' _ a:statement
		{ return { if: d, then: c, else: a } }        
    / 'if' _ d:digit _ c:statement _ 'otherwise' EOL a:block EOB
		{ return { if: d, then: c, else: a } }
	/ 'if' _ d:digit _ c:statement _ 'otherwise' _ a:statement
		{ return { if: d, then: c, else: a } }
	/ 'if' _ d:digit EOL c:block EOB
		{ return { if: d, then: c } }
    / 'if' _ d:digit _ c:statement
		{ return { if: d, then: c } }

statement =
	conditional    
    / 'say' _ d:digit { return "say " + d }

EOS = _ [.?!;]
	/ EOL

digit = $([0-9]+)
EOL = _ '\r'? '\n'
_ = [ \t]*
EOF = EOL* _!.
	
```

THIS ONE WORKS:

```
program = head:statement EOL+ tail:program
	{ return [ head ].concat(tail) }
	/ head:statement
    	{ return [ head ] }
   / EOF { return [] }

block
	= _? head:statement EOS tail:block
    	{ return [ head ].concat(tail) }
    / _? head:statement 
    	{ return [ head ] }        

EOB = EOL &EOL
    / EOS* &(_? else)
    / EOS* _? end
   	/ EOS* ','? _? 'o' &('o'+ 'h')
    / EOF

conditional 
	= 'if' _ d:digit EOL c:block EOB _? else EOL a:block EOB
		{ return { if: d, then: c, else: a } }        
	/ 'if' _ d:digit EOL c:block EOB _? else _ a:statement
		{ return { if: d, then: c, else: a } }        
    / 'if' _ d:digit _ c:statement _ else EOL a:block EOB
		{ return { if: d, then: c, else: a } }
	/ 'if' _ d:digit _ c:statement _ else _ a:statement
		{ return { if: d, then: c, else: a } }
	/ 'if' _ d:digit EOL c:block EOB
		{ return { if: d, then: c } }
    / 'if' _ d:digit _ c:statement
		{ return { if: d, then: c } }

statement =
	conditional    
    / print _ d:digit { return "say " + d }

end = 'end' / 'oh' / 'yeah' / 'baby'

print = 'print' / 'say'

EOS = _? [.?!;]
	/ EOL
else = 'otherwise' / 'else'
digit = $([0-9]+)
EOL = _? '\r'? '\n'
whitespace = [ \t]+
comment = '(' [^)]* ')'
_ = (whitespace / comment)+ 
EOF = EOL* _? !.
	
```

```
if 1
if 2
if 3
if 4
say 4 oh yeah baby
say 1
yeah
say 0

if 1
if 2
if 3
if 4
say 4 oooh
say 1
yeah
say 0



if 1
say 1

if 1 say 1

if 1
	if 2
    	say 2
    else
    	say 1                       

if 1 say 1 else
say 2
say 3
say 4
end
say 5

if 1
say 1
  otherwise
say 2

if 1
if 2
if 3
if 4
say 4
end
end
 otherwise
say 1
end
```