"""
Rockstar Reference Compiler's lexer. Turns a source file into an array of tokens which can then be parsed by the parser.
Entrypoint is lexer.lex()
"""
from typing import Tuple
import datatypes


def skip_whitespace(source: str, in_idx: int) -> int:
    """
    Helper function that skips past all whitespace on the line.

    :param source:    String of the source file
    :param in_idx:    Index to first character that might be whitespace. Must not equal len(source)
    :return:          Index to first non-whitespace character after index provided
    """
    assert len(source) != in_idx

    idx: int = in_idx
    src_length: int = len(source)

    while source[idx] != '\n' and source[idx].isspace() and idx < src_length:
        idx += 1

    return idx


def get_srcloc(line: int, line_start: int, start_idx: int, end_idx: int) -> datatypes.SourceLocation:
    """
    No lexer token can straddle two lines, so helper function simplifies creation

    :param line:          Line number
    :param line_start:    Index to character _after_ previous newline
    :param start_idx:     Start index to token
    :param end_idx:       Index one passed the end of the token
    :return:              SourceLocation with proper values
    """
    return datatypes.SourceLocation(line, start_idx - line_start, line, end_idx - line_start)


def parse_number(source: str, in_idx: int) -> Tuple[int, datatypes.Number]:
    """
    Parses a number into the proper rockstar format.

    :param source:    String of the source file
    :param in_idx:    Index of the first character of the number. Must not equal len(source)
    :return:          Tuple of the first non-number character and the parsed number
    """
    assert len(source) != in_idx

    idx = in_idx
    src_length = len(source)

    if source[idx] == '-':
        idx += 1

    while idx < src_length and source[idx].isnumeric():
        idx += 1

    if idx < src_length and source[idx] == '.':
        idx += 1

        while idx < src_length and source[idx].isnumeric():
            idx += 1

    try:
        number = datatypes.Number(source[in_idx : idx])
    except datatypes.InvalidNumber:
        raise datatypes.LexerError(f"{source[in_idx : idx]} is not a valid number.")

    return idx, number


def lex(source: str) -> datatypes.TokenStream:
    """
    Turns a source file into an array of tokens which can then be parsed by the parser.

    :param source:                   String of the source file
    :return:                         List of tokens
    :raises datatypes.LexerError:    On invalid token
    """
    idx: int = 0
    src_length: int = len(source)

    line_idx: int = 0
    line: int = 0

    tokens: datatypes.TokenStream = datatypes.TokenStream()

    while idx < src_length:
        start_idx = idx
        current_char = source[idx]

        if current_char.isspace():
            idx = skip_whitespace(source, idx)
        elif current_char.isnumeric() or current_char == '-':
            idx, number = parse_number(source, idx)

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Number, data=number, location=location))

    return tokens
