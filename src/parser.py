"""
Rockstar Reference Compiler's recursive decent parser. Turns an array of tokens into an abstract syntax tree..
Entry point is parser.parse()
"""

from typing import Optional
from datatypes import TokenConsumer, TokenType, TokenStream, ASTType, ASTNode, SourceLocation, ParserError, Token

class RockstarParser:
    """
    Container to store persistent information needed while parsing
    """

    __token_consumer: TokenConsumer

    def __init__(self, token_consumer: TokenConsumer) -> None:
        self.__token_consumer = token_consumer

    def make_missing_token_error(self, expected_type: TokenType) -> ParserError:
        """
        Builds a ParserError detailing the expected token type and the type found instead.

        :param expected_type:   The token type expected to be found
        :return:                A ParserError detailing the error with the location
        """
        next_token: Token = self.__token_consumer.unconditional_get_next()
        return ParserError(f"Missing expected token: {expected_type}. Found token: {next_token.type}",
                           next_token.location, 0, 0)

    def program(self) -> ASTNode:
        """
        <program>
        """

        program: ASTNode = ASTNode(ASTType.Program, None, location=SourceLocation(0, 0, 0, 0))

        while self.__token_consumer.skip_next(TokenType.Newline):
            while self.__token_consumer.skip_next(TokenType.Newline):
                pass

            if self.__token_consumer.skip_next(TokenType.EOF):
                # we're done
                return program

            statement: ASTNode = self.statement()

            program.location.extend_self(statement.location)
            program.children.append(statement)

        if self.__token_consumer.has_token():
            token: Token = self.__token_consumer.unconditional_get_next()
            raise ParserError(f"Unexpected token: {token.type}", location=token.location, start_idx=0, end_idx=0)

    def statement(self) -> ASTNode:
        if self.__token_consumer.is_next(TokenType.ReservedPut):
            return self.put_statement()
        if self.__token_consumer.is_next(TokenType.ReservedListen):
            return self.listen_statement()
        if self.__token_consumer.is_next(TokenType.ReservedSay):
            return self.say_statement()
        if self.__token_consumer.is_next(TokenType.ReservedReturn):
            return self.give_back_statement()
        if self.__token_consumer.is_next(TokenType.ReservedIf):
            return self.if_statement()
        if self.__token_consumer.is_next(TokenType.ReservedWhile):
            return self.while_statement()
        if self.__token_consumer.is_next(TokenType.ReservedUntil):
            return self.until_statement()
        if self.__token_consumer.is_next(TokenType.ReservedBuild):
            return self.increment_or_decrement_statement(ASTType.Increment)
        if self.__token_consumer.is_next(TokenType.ReservedKnock):
            return self.increment_or_decrement_statement(ASTType.Decrement)
        if self.__token_consumer.is_next(TokenType.ReservedContinue):
            return self.continue_statement()
        if self.__token_consumer.is_next(TokenType.ReservedBreak):
            return self.break_statement()
        return self.variable_statement()

    def put_statement(self) -> ASTNode:
        """
        "put" <expr> "into" <variable>
        """
        put_token: Optional[Token] = self.__token_consumer.get_next(TokenType.ReservedPut)
        if put_token is None:
            raise self.make_missing_token_error(TokenType.ReservedPut)

        expr: ASTNode = self.expr()

        if not self.__token_consumer.skip_next(TokenType.ReservedInto):
            raise self.make_missing_token_error(TokenType.ReservedInto)

        variable: ASTNode = self.variable()

        surrounding_location: SourceLocation = put_token.location.extend(variable.location)
        return ASTNode(ASTType.Set, None, location=surrounding_location, children=[variable, expr])

    def say_statement(self) -> ASTNode:
        """
        <say_commands> <expr>
        """
        say_token: Optional[Token] = self.__token_consumer.get_next(TokenType.ReservedSay)
        if say_token is None:
            raise self.make_missing_token_error(TokenType.ReservedSay)

        expr: ASTNode = self.expr()

        surrounding_location: SourceLocation = say_token.location.extend(expr.location)
        return ASTNode(ASTType.Print, None, location=surrounding_location, children=[expr])

    def give_back_statement(self) -> ASTNode:
        """
        "give" "back" <expr>
        """
        give_back_token: Optional[Token] = self.__token_consumer.get_next(TokenType.ReservedReturn)
        if give_back_token is None:
            raise self.make_missing_token_error(TokenType.ReservedReturn)

        expr: ASTNode = self.expr()

        surrounding_location: SourceLocation = give_back_token.location.extend(expr.location)
        return ASTNode(ASTType.Return, None, location=surrounding_location, children=[expr])

    def continue_statement(self) -> ASTNode:
        """
        "continue" | ("take" "it" "to" "the" "top")
        """
        continue_token: Optional[Token] = self.__token_consumer.get_next(TokenType.ReservedContinue)
        if continue_token is None:
            raise self.make_missing_token_error(TokenType.ReservedContinue)

        return ASTNode(ASTType.Continue, None, location=continue_token.location, children=[])

    def break_statement(self) -> ASTNode:
        """
        "break" ("it" "down")?
        """
        break_token: Optional[Token] = self.__token_consumer.get_next(TokenType.ReservedBreak)
        if break_token is None:
            raise self.make_missing_token_error(TokenType.ReservedBreak)

        return ASTNode(ASTType.Break, None, location=break_token.location, children=[])

    def increment_or_decrement_statement(self, ast_type: ASTType) -> ASTNode:
        """
        "build" <variable> "up" (","? "up")*
        "knock" <variable> "down" (","? "down")*

        Parses an increment or decrement statement, depending on the passed in ast_type,
        and returns the created ASTNode.

        :param ast_type: Whether this is increment or decrement
        :return:         The ASTNode representing this operation
        """
        assert ast_type in (ASTType.Increment, ASTType.Decrement)
        # verb_token_type will be "build" for an increment and "knock" for a decrement
        # direction_token_type will be "up" for an increment and "down" for a decrement
        verb_token_type: TokenType = TokenType.ReservedBuild
        direction_token_type: TokenType = TokenType.ReservedUp
        if ast_type == ASTType.Decrement:
            verb_token_type = TokenType.ReservedKnock
            direction_token_type = TokenType.ReservedDown

        verb_token: Optional[Token] = self.__token_consumer.get_next(verb_token_type)
        if verb_token is None:
            raise self.make_missing_token_error(verb_token_type)

        variable: ASTNode = self.variable()

        first_direction_token: Optional[Token] = self.__token_consumer.get_next(direction_token_type)
        if first_direction_token is None:
            raise self.make_missing_token_error(direction_token_type)

        # The amount being incremented or decremented. Always positive either way.
        modification_amount = 1
        # The last "up" or "down" token, used to determine location of the ASTNode.
        last_direction_token: Token = first_direction_token

        while self.__token_consumer.is_next(TokenType.Comma) or self.__token_consumer.is_next(direction_token_type):
            # Skips comma, or does nothing if the next token isn't a comma
            self.__token_consumer.skip_next(TokenType.Comma)
            direction_token: Optional[Token] = self.__token_consumer.get_next(direction_token_type)
            # If it was a comma, the next token must be an up/down token
            if direction_token is None:
                raise self.make_missing_token_error(direction_token_type)
            modification_amount += 1
            last_direction_token = direction_token

        surrounding_location: SourceLocation = verb_token.location.extend(last_direction_token.location)
        return ASTNode(ast_type, data=modification_amount, location=surrounding_location, children=[variable])

def parse(tokens: TokenStream) -> ASTNode:
    """
    Parses the input token stream into an AST

    :param tokens:    Tokens to parse
    :return:          AST from input
    """
    parser = RockstarParser(TokenConsumer(tokens))

    return parser.program()
