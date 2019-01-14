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
        if self.__token_consumer.is_next(TokenType.ReservedListenTo):
            return self.listen_to_statement()
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
            return self.increment_statement()
        if self.__token_consumer.is_next(TokenType.ReservedKnock):
            return self.decrement_statement()
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

    def listen_statement(self) -> ASTNode:
        """
        "listen"
        """
        listen_token: Optional[Token] = self.__token_consumer.get_next(TokenType.ReservedListen)
        if listen_token is None:
            raise self.make_missing_token_error(TokenType.ReservedListen)
        return ASTNode(ASTType.GetLine, None, location=listen_token.location, children=[])

    def listen_to_statement(self) -> ASTNode:
        """
        "listen to" <variable>
        """
        listen_to_token: Optional[Token] = self.__token_consumer.get_next(TokenType.ReservedListenTo)
        if listen_to_token is None:
            raise self.make_missing_token_error(TokenType.ReservedListenTo)

        variable: ASTNode = self.variable()

        surrounding_location = listen_to_token.location.extend(variable.location)
        return ASTNode(ASTType.GetLine, None, location=surrounding_location, children=[variable])

def parse(tokens: TokenStream) -> ASTNode:
    """
    Parses the input token stream into an AST

    :param tokens:    Tokens to parse
    :return:          AST from input
    """
    parser = RockstarParser(TokenConsumer(tokens))

    return parser.program()
