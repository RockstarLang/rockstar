"""
Module containing all datatypes used within the compiler.
"""
from typing import NamedTuple, Any, Optional, List
from enum import Enum, auto
import decimal


class SourceLocation:
    """
    Represents a pair of start and end locations for the lexer token/ast node.
    """
    line_start: int
    char_start: int
    line_end: int
    char_end: int

    def __init__(self, line_start: int, char_start: int, line_end: int, char_end: int) -> None:
        self.line_start = line_start
        self.char_start = char_start
        self.line_end = line_end
        self.char_end = char_end

    def extend(self, that: 'SourceLocation') -> 'SourceLocation':
        """
        Combine two source locations to get the source location that surrounds both.

        :param that:    Other SourceLocation
        :return:        New SourceLocation
        """
        loc = SourceLocation(line_start=self.line_start, char_start=self.char_start,
                             line_end=self.line_end, char_end=self.char_end)
        loc.extend_self(that)
        return loc

    def extend_self(self, that: 'SourceLocation') -> None:
        """
        Combines another SourceLocation with this one, setting this one to surround both.

        :param that:    Other SourceLocation
        """
        self.line_start, self.char_start = min((self.line_start, self.char_start), (that.line_start, that.char_start))
        self.line_end, self.char_end = max((self.line_end, self.char_end), (that.line_end, that.char_end))


class RockstarError(Exception):
    """
    Exception with location data.
    """
    location: SourceLocation
    start_idx: int
    end_idx: int

    def __init__(self, message: str, location: SourceLocation, start_idx: int, end_idx: int) -> None:
        super().__init__(message)

        self.location = location
        self.start_idx = start_idx
        self.end_idx = end_idx


class PreprocessorError(RockstarError):
    """
    Error that occurred within the preprocessor.
    """
    pass


class LexerError(RockstarError):
    """
    Error that occurred within the parser.
    """
    pass


class ParserError(RockstarError):
    """
    Error that occurred within the parser.
    """
    pass


class RuntimeTypeError(RockstarError):
    """
    Type error that occurred during runtime.
    """
    pass


class RuntimeArithmeticError(RockstarError):
    """
    Arithmetic error that occurred during runtime.
    """
    pass


class RuntimeComparisonError(RockstarError):
    """
    Comparison error that occurred during runtime.
    """
    pass


class Number(decimal.Decimal):
    """
    A rockstar compliant number type
    """
    pass


InvalidNumber = decimal.InvalidOperation  # pylint: disable=invalid-name


class TokenType(Enum):
    """
    Indicates which type the current token is.
    """
    EOF = auto()                     # End of token stream
    Newline = auto()                 # `\n`
    Comma = auto()                   # `,`
    Period = auto()                  # '.'

    Mysterious = auto()              # `mysterious`
    Null = auto()                    # `null/nothing/nowhere/nobody/gone/empty`
    BooleanTrue = auto()             # `true/right/yes/ok`
    BooleanFalse = auto()            # `false/wrong/no/lies`
    Number = auto()                  # `1234567890`
    String = auto()                  # `"Hello"`
    Pronoun = auto()                 # `it/he/she/him/her/they/them/ze/hir/zie/zir/xe/xem/ve/ver`

    Word = auto()                    # Any word that isn`t a keyword

    ReservedCommonVar = auto()       # `a/an/the/my/your`

    ReservedIf = auto()              # `if`
    ReservedElse = auto()            # `else`
    ReservedWhile = auto()           # `while`
    ReservedUntil = auto()           # `until`

    ReservedTakes = auto()           # `Func takes Val and Val2` (takes)
    ReservedAnd = auto()             # `Func takes Val and Val2` (and)

    ReservedTaking = auto()          # `Func taking Val` (taking)
    ArgumentSeparator = auto()       # `Func taking Val 'n'/& Val` ('n', &)

    ReservedBuild = auto()           # `build Val up` (build)
    ReservedUp = auto()              # `build Val up` (up)
    ReservedKnock = auto()           # `knock Val down` (knock)
    ReservedDown = auto()            # `knock Val down` (down)
    ReservedBreak = auto()           # `break it down`
    ReservedContinue = auto()        # `continue` or `take it to the top`
    ReservedPut = auto()             # `put Val into Val2` (put)
    ReservedInto = auto()            # `put Val into Val2` (into)
    ReservedListen = auto()          # `listen to Val` (listen)
    ReservedListenTo = auto()        # `listen to Val` (listen to)
    ReservedSay = auto()             # `say/shout/whisper/scream Val` (say)
    ReservedReturn = auto()          # `give back Val` (give back)

    ReservedSays = auto()            # `Var says hi` (says)
    ReservedAssignment = auto()      # `Var is/are/was/were/`s mysterious`
    ReservedExprAssignment = auto()  # `Var thinks mysterious` (thinks)

    ReservedIs = auto()              # `Val is Val2` (is)
    ReservedAs = auto()              # `Val is as great as` (as)
    ReservedOr = auto()              # `Val or Val2` (or)
    ReservedNor = auto()             # `Val nor Val2` (nor)
    ReservedGTE = auto()             # `higher/greater/bigger/stronger`
    ReservedLTE = auto()             # `lower/less/smaller/weaker`
    ReservedGT = auto()              # `high/great/big/strong`
    ReservedLS = auto()              # `low/little/small/weak`
    ReservedNEQ = auto()             # `aint/ain't`
    ReservedNegation = auto()        # `not`
    ReservedPlus = auto()            # `plus/with`
    ReservedMinus = auto()           # `minus/without`
    ReservedMultiply = auto()        # `times/of`
    ReservedDivide = auto()          # `over`


class Token(NamedTuple):
    """
    Lexer token. Data stores the "value" associated with the token. If there isn't a value associated with the
    token, it holds a string of the original text that the token represents. This is to allow poetic literals to work.
    """
    type: TokenType
    data: Any
    location: SourceLocation


TokenStream = List[Token]


class TokenConsumer:
    """
    Helper container which allows easy access into the stream of tokens for the parser. The parser needs access to one
    token at a time, and the ability to consume, skip, and check the next token.
    """

    __tokens: TokenStream
    __token_count: int
    __index: int

    def __init__(self, tokens: TokenStream) -> None:
        """
        :param tokens:    Tokens to consume
        """
        self.__tokens = tokens
        self.__token_count = len(tokens)
        self.__index = 0

    def get_next(self, expected: TokenType) -> Optional[Token]:
        """
        If the next token is of type expected, consumes and returns the token. Otherwise returns None

        :param expected:    Type expected to be next in the stream
        :return:            The token if token is of type expected, None otherwise
        """
        if self.__index < self.__token_count and self.__tokens[self.__index].type == expected:
            ret: Token = self.__tokens[self.__index]
            self.__index += 1
            return ret
        return None

    def skip_next(self, expected: TokenType) -> bool:
        """
        If the next token is of type expected, consumes the token.

        :param expected:    Type expected to be next in the stream
        :return:            If token is of type expected
        """
        if self.__index < self.__token_count and self.__tokens[self.__index].type == expected:
            self.__index += 1
            return True
        return False

    def is_next(self, expected: TokenType, offset: int = 0) -> bool:
        """
        Checks if the next token is of type expected without consumption

        :param expected:    Type expected to be next in the stream
        :param offset:      Offset to check
        :return:            If token is of type expected
        """
        return self.__index + offset < self.__token_count and self.__tokens[self.__index + offset].type == expected

    def advance(self) -> None:
        """
        Consumes a token

        :return:    None
        """
        if self.__index < self.__token_count:
            self.__index += 1

    def has_token(self) -> bool:
        return self.__index >= self.__token_count

    def unconditional_get_next(self) -> Token:
        if self.__index < self.__token_count:
            ret: Token = self.__tokens[self.__index]
            self.__index += 1
            return ret


class ASTType(Enum):
    """
    Indicates the type of AST node.
    """
    CommonVariable = auto()  # data: string "my:variable"
    ProperVariable = auto()  # data: string "MyBestVariable"
    Pronoun = auto()         # data: None

    ConstantMysterious = auto()  # data: None
    ConstantNull = auto()        # data: None
    ConstantBoolean = auto()     # data: bool
    ConstantNumber = auto()      # data: float
    ConstantString = auto()      # data: string "this is the contents of my string"

    FunctionCall = auto()        # children: [Variable, Arguments...]
    Break = auto()               # children: []
    Continue = auto()            # children: []
    Return = auto()              # children: [value]

    Addition = auto()            # children: [lhs, rhs]
    Subtraction = auto()         # children: [lhs, rhs]
    Multiplication = auto()      # children: [lhs, rhs]
    Division = auto()            # children: [lhs, rhs]

    Greater = auto()             # children: [lhs, rhs]
    Less = auto()                # children: [lhs, rhs]
    GreaterEq = auto()           # children: [lhs, rhs]
    LessEq = auto()              # children: [lhs, rhs]

    Eq = auto()                  # children: [lhs, rhs]
    Neq = auto()                 # children: [lhs, rhs]
    And = auto()                 # children: [lhs, rhs]
    Or = auto()                  # children: [lhs, rhs]
    Nor = auto()                 # children: [lhs, rhs]

    Increment = auto()           # children: [variable]
    Decrement = auto()           # children: [variable]

    Print = auto()               # children: [value]
    GetLine = auto()             # children: [variable]
    Set = auto()                 # children: [variable, value]

    IfStatement = auto()         # children: [condition, statements...]
    WhileStatement = auto()      # children: [condition, statements...]
    UntilStatement = auto()      # children: [condition, statements...]

    FunctionArgs = auto()        # children: [arg1, argN...]
    FunctionDecl = auto()        # children: [name, FunctionArgs, statements...]

    Program = auto()             # children: [statements]


class ASTNode:
    """
    A node in the AST. May contain data and zero or more children.
    """
    node_type: ASTType
    data: Any
    location: SourceLocation
    children: List['ASTNode']

    def __init__(self,
                 node_type: ASTType,
                 data: Any,
                 location: SourceLocation,
                 children: List['ASTNode'] = List['ASTNode']()) \
            -> None:
        self.node_type = node_type
        self.data = data
        self.location = location
        self.children = children
