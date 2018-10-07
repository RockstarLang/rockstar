"""
Rockstar Reference Compiler's lexer. Turns a source file into an array of tokens which can then be parsed by the parser.
Entrypoint is lexer.lex()
"""
from functools import partial
from typing import Callable, Tuple
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


def get_lexer_exception(msg: str, line: int, line_start: int, start_idx: int, end_idx: int) -> datatypes.LexerError:
    """
    Generates a LexerError with the right msg and indexes.

    :param msg:           Error message
    :param line:          Line number
    :param line_start:    Index to character _after_ previous newline
    :param start_idx:     Start index to token
    :param end_idx:       Index one passed the end of the token
    :return:
    """
    return datatypes.LexerError(msg, get_srcloc(line, line_start, start_idx, end_idx))


ErrorGenerator = Callable[[str, int, int], datatypes.LexerError]


def measure_indentation(source: str,
                        in_idx: int,
                        error_generator: ErrorGenerator) -> Tuple[int, int]:
    """
    Measures how many levels of indentation are at position in_idx. Mixed indentation not allowed. 4 spaces per indent.
    1 tab = 4 spaces

    :param source:             String of the source file
    :param in_idx:             Index to measure indentation from
    :param error_generator:    Constructs a error to throw. Arguments (msg, start_idx, end_idx)
    :return:                   Tuple of the first non-indentation character and the levels of indentation
    """

    idx: int = in_idx
    indentation: int = 0

    source_length: int = len(source)

    while idx < source_length and source[idx] == '\t':
        idx += 1
        indentation += 1

        if idx + 1 < source_length and source[idx] == ' ':
            raise error_generator("Cannot mix spaces and tabs within indentation.", in_idx, idx)

    # Allowed to immediately move on to spaces as if there is a space following
    # a collection of tabs, it will raise an error and never hit this code
    while idx + 3 < source_length and source[idx : idx + 4] == '    ':
        idx += 1
        indentation += 1

        if idx + 1 < source_length and source[idx] == '\t':
            raise error_generator("Cannot mix spaces and tabs within indentation.", in_idx, idx)

    return idx, indentation


def parse_number(source: str,
                 in_idx: int,
                 error_generator: ErrorGenerator) -> Tuple[int, datatypes.Number]:
    """
    Parses a number into the proper rockstar format.

    :param source:    String of the source file
    :param in_idx:    Index of the first character of the number. Must not equal len(source)
    :param error_generator:    Constructs a error to throw. Arguments (msg, start_idx, end_idx)
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
        raise error_generator(f"{source[in_idx : idx]} is not a valid number.", in_idx, idx)

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
    line: int = 1

    after_newline: bool = True

    indentation: int = 0

    tokens: datatypes.TokenStream = datatypes.TokenStream()

    while idx < src_length:
        start_idx = idx
        current_char = source[idx]
        error_func: ErrorGenerator = partial(get_lexer_exception, line=line, line_idx=line_idx)

        if after_newline:
            new_idx, new_indents = measure_indentation(source, idx, error_func)
            indent_diff = new_indents - indentation

            if indent_diff < 0:
                for _ in range(-indent_diff):
                    location = get_srcloc(line, line_idx, idx, new_idx)
                    tokens.append(datatypes.Token(type=datatypes.TokenType.Dedent, data=None, location=location))
            elif indent_diff > 1:
                for _ in range(indent_diff):
                    location = get_srcloc(line, line_idx, idx, new_idx)
                    tokens.append(datatypes.Token(type=datatypes.TokenType.Indent, data=None, location=location))

            idx = new_idx
            after_newline = False

        elif current_char.isspace():
            idx = skip_whitespace(source, idx)

        elif current_char.isnumeric() or current_char == '-':
            idx, number = parse_number(source, idx, error_func)

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Number, data=number, location=location))

        elif current_char == '"':
            matching_idx = source.find('"', idx + 1)
            idx = matching_idx + 1

            location = get_srcloc(line, line_idx, start_idx, idx)
            contents = source[start_idx + 1 : matching_idx]
            tokens.append(datatypes.Token(type=datatypes.TokenType.String, data=contents, location=location))

        elif current_char == '\n':
            old_column = idx - line_idx
            old_line = line

            idx += 1
            line += 1
            line_idx = idx

            location = datatypes.SourceLocation(old_line, old_column, line, 0)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Newline, data=None, location=location))
            after_newline = True

    return tokens
