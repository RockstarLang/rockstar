from typing import NamedTuple, Any
from enum import Enum, auto


class SourceLocation(NamedTuple):
    line: int
    char: int


class TokenTypes(Enum):
    EOF = auto()                  # End of token stream
    Mysterious = auto()           # `mysterious`
    Null = auto()                 # `null/nothing/nowhere/nobody/gone/empty`
    Boolean = auto()              # `true/right/yes/ok` -> True; `false/wrong/no/lies` -> False
    Number = auto()               # `1234567890`
    String = auto()               # `"Hello"`
    Pronoun = auto()              # `it/he/she/him/her/they/them/ze/hir/zie/zir/xe/xem/ve/ver`

    Word = auto()                 # Any word that isn`t a keyword

    ReservedCommonVar = auto()    # `a/an/the/my/your`

    ReservedIf = auto()           # `if`
    ReservedElse = auto()         # `else`
    ReservedWhile = auto()        # `while`
    ReservedUntil = auto()        # `until`

    ReservedTakes = auto()        # `Func takes Val and Val2` (takes)
    ReservedAnd = auto()          # `Func takes Val and Val2` (and)
    ReservedBuild = auto()        # `build Val up` (build)
    ReservedUp = auto()           # `build Val up` (up)
    ReservedKnock = auto()        # `knock Val down` (knock)
    ReservedDown = auto()         # `knock Val down` (down)
    ReservedBreak = auto()        # `break it down`
    ReservedContinue = auto()     # `continue` or `take it to the top`
    ReservedPut = auto()          # `put Val into Val2` (put)
    ReservedInto = auto()         # `put Val into Val2` (into)
    ReservedListen = auto()       # `listen to Val` (listen to)
    ReservedSay = auto()          # `say/shout/whisper/scream Val` (say)
    ReservedReturn = auto()       # `give back Val` (give back)

    ReservedSays = auto()         # `Var says hi`
    ReservedAssignment = auto()   # `Var is/was/were/`s mysterious`

    ReservedIs = auto()           # `Val is Val2` (is)
    ReservedAs = auto()           # `Val is as great as` (as)
    ReservedOr = auto()           # `Val or Val2` (or)
    ReservedNor = auto()          # `Val nor Val2` (nor)
    ReservedGTE = auto()          # `higher/greater/bigger/stronger`
    ReservedLTE = auto()          # `lower/less/smaller/weaker
    ReservedGT = auto()           # `high/great/big/strong`
    ReservedLS = auto()           # `low/little/small/weak`
    ReservedNEQ = auto()          # `aint/ain't`
    ReservedNegation = auto()     # `not`
    ReservedPlus = auto()         # `plus/with`
    ReservedMinus = auto()        # `minus/without`
    ReservedMultiply = auto()     # `times/of`
    ReservedDivide = auto()       # `over`


class Token(NamedTuple):
    type: TokenTypes
    data: Any
    location: SourceLocation


class TokenStream(list):
    pass
