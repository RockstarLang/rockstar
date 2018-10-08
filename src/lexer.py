"""
Rockstar Reference Compiler's lexer. Turns a source file into an array of tokens which can then be parsed by the parser.
Entrypoint is lexer.lex()
"""
from typing import Callable, Tuple, Dict, Optional
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

    while idx < src_length and source[idx] != '\n' and source[idx].isspace():
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
    return datatypes.SourceLocation(line, start_idx - line_start + 1, line, end_idx - line_start + 1)


def get_lexer_exception(msg: str, line: int, line_start: int, start_idx: int, end_idx: int) -> datatypes.LexerError:
    """
    Generates a LexerError with the right msg and indexes.

    :param msg:                      Error message
    :param line:                     Line number
    :param line_start:               Index to character _after_ previous newline
    :param start_idx:                Start index to token
    :param end_idx:                  Index one passed the end of the token
    :return:                         LexerError with proper values set
    """
    return datatypes.LexerError(msg, get_srcloc(line, line_start, start_idx, end_idx), start_idx, end_idx)


ErrorGenerator = Callable[[str, int, int], datatypes.LexerError]


def parse_number(source: str,
                 in_idx: int,
                 error_generator: ErrorGenerator) -> Tuple[int, datatypes.Number]:
    """
    Parses a number into the proper rockstar format.

    :param source:                   String of the source file
    :param in_idx:                   Index of the first character of the number. Must not equal len(source)
    :param error_generator:          Constructs a error to throw. Arguments (msg, start_idx, end_idx)
    :return:                         Tuple of the first non-number character and the parsed number
    :raises datatypes.LexerError:    On invalid number
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


def get_next_word(source: str, in_idx: int) -> Tuple[int, str]:
    """
    Gets the next word after in_idx after skipping whitespace

    :param source:                   String of the source file
    :param in_idx:                   Index of the first character to search on. Must not equal len(source)
    :return:                         Tuple of first non-keyword character and the normalized string produced
    """
    assert len(source) != in_idx

    idx: int = in_idx
    source_length = len(source)

    idx = skip_whitespace(source, idx)
    start_idx = idx

    while idx < source_length and source[idx].isalpha():
        idx += 1

    return idx, source[start_idx:idx].lower()


def expect_word(source: str, in_idx: int, expected: str, phrase: str, error_generator: ErrorGenerator) -> int:
    """
    Parses the next word after in_idx and whitespace and expects it to be the value passed in through expected

    :param source:                   String of the source file
    :param in_idx:                   Index of the first character of the word. Must not equal len(source)
    :param expected:                 The keyword to expect
    :param phrase:                   The larger phrase that the keyword shows up in. Helps the error message.
    :param error_generator:          Constructs a error to throw. Arguments (msg, start_idx, end_idx
    :return:
    :raises datatypes.LexerError:
    """

    last_end_idx = in_idx

    idx, word = get_next_word(source, in_idx)
    if idx == last_end_idx or word != expected:
        raise error_generator(f"Expected '{expected}' within '{phrase}'. Got {word}.",
                              last_end_idx,
                              idx)

    return idx


SINGLE_KEYWORDS: Dict[str, datatypes.TokenType] = {
    'mysterious': datatypes.TokenType.Mysterious,
    'null': datatypes.TokenType.Null,
    'nothing': datatypes.TokenType.Null,
    'nowhere': datatypes.TokenType.Null,
    'nobody': datatypes.TokenType.Null,
    'gone': datatypes.TokenType.Null,
    'empty': datatypes.TokenType.Null,
    'true': datatypes.TokenType.BooleanTrue,
    'right': datatypes.TokenType.BooleanTrue,
    'yes': datatypes.TokenType.BooleanTrue,
    'ok': datatypes.TokenType.BooleanTrue,
    'false': datatypes.TokenType.BooleanFalse,
    'wrong': datatypes.TokenType.BooleanFalse,
    'no': datatypes.TokenType.BooleanFalse,
    'lies': datatypes.TokenType.BooleanFalse,
    'it': datatypes.TokenType.Pronoun,
    'he': datatypes.TokenType.Pronoun,
    'she': datatypes.TokenType.Pronoun,
    'him': datatypes.TokenType.Pronoun,
    'her': datatypes.TokenType.Pronoun,
    'they': datatypes.TokenType.Pronoun,
    'them': datatypes.TokenType.Pronoun,
    'ze': datatypes.TokenType.Pronoun,
    'hir': datatypes.TokenType.Pronoun,
    'zie': datatypes.TokenType.Pronoun,
    'zir': datatypes.TokenType.Pronoun,
    'xe': datatypes.TokenType.Pronoun,
    'xem': datatypes.TokenType.Pronoun,
    've': datatypes.TokenType.Pronoun,
    'ver': datatypes.TokenType.Pronoun,
    'a': datatypes.TokenType.ReservedCommonVar,
    'an': datatypes.TokenType.ReservedCommonVar,
    'the': datatypes.TokenType.ReservedCommonVar,
    'my': datatypes.TokenType.ReservedCommonVar,
    'your': datatypes.TokenType.ReservedCommonVar,
    'if': datatypes.TokenType.ReservedIf,
    'else': datatypes.TokenType.ReservedElse,
    'while': datatypes.TokenType.ReservedWhile,
    'until': datatypes.TokenType.ReservedUntil,
    'takes': datatypes.TokenType.ReservedTakes,
    'and': datatypes.TokenType.ReservedAnd,
    'build': datatypes.TokenType.ReservedBuild,
    'up': datatypes.TokenType.ReservedUp,
    'knock': datatypes.TokenType.ReservedKnock,
    'down': datatypes.TokenType.ReservedDown,
    'continue': datatypes.TokenType.ReservedContinue,
    'put': datatypes.TokenType.ReservedPut,
    'into': datatypes.TokenType.ReservedInto,
    'say': datatypes.TokenType.ReservedSay,
    'shout': datatypes.TokenType.ReservedSay,
    'whisper': datatypes.TokenType.ReservedSay,
    'scream': datatypes.TokenType.ReservedSay,
    'was': datatypes.TokenType.ReservedAssignment,
    'were': datatypes.TokenType.ReservedAssignment,
    'is': datatypes.TokenType.ReservedIs,
    'as': datatypes.TokenType.ReservedAs,
    'or': datatypes.TokenType.ReservedOr,
    'nor': datatypes.TokenType.ReservedNor,
    'higher': datatypes.TokenType.ReservedGTE,
    'greater': datatypes.TokenType.ReservedGTE,
    'bigger': datatypes.TokenType.ReservedGTE,
    'stronger': datatypes.TokenType.ReservedGTE,
    'lower': datatypes.TokenType.ReservedLTE,
    'less': datatypes.TokenType.ReservedLTE,
    'smaller': datatypes.TokenType.ReservedLTE,
    'weaker': datatypes.TokenType.ReservedLTE,
    'high': datatypes.TokenType.ReservedGT,
    'great': datatypes.TokenType.ReservedGT,
    'big': datatypes.TokenType.ReservedGT,
    'strong': datatypes.TokenType.ReservedGT,
    'low': datatypes.TokenType.ReservedLS,
    'little': datatypes.TokenType.ReservedLS,
    'small': datatypes.TokenType.ReservedLS,
    'weak': datatypes.TokenType.ReservedLS,
    'aint': datatypes.TokenType.ReservedNEQ,
    # 'ain\'t': datatypes.TokenType.ReservedNEQ, Special cased below
    'not': datatypes.TokenType.ReservedNegation,
    'plus': datatypes.TokenType.ReservedPlus,
    'with': datatypes.TokenType.ReservedPlus,
    'minus': datatypes.TokenType.ReservedMinus,
    'without': datatypes.TokenType.ReservedMinus,
    'times': datatypes.TokenType.ReservedMultiply,
    'of': datatypes.TokenType.ReservedMultiply,
    'over': datatypes.TokenType.ReservedDivide
}


def word_symbolizer(source: str, in_idx: int, error_generator: ErrorGenerator) -> Tuple[int, datatypes.TokenType]:
    """
    Converts the keyword(s) at in_idx into either a keyword or bare word token type

    :param source:                   String of the source file
    :param in_idx:                   Index of the first character of the word. Must not equal len(source)
    :param error_generator:          Constructs a error to throw. Arguments (msg, start_idx, end_idx)
    :return:                         Tuple of first non-keyword character and the token produced
    :raises datatypes.LexerError:    On invalid keyword/bare word
    """
    assert len(source) != in_idx

    idx: int = in_idx

    idx, first_word = get_next_word(source, idx)

    if first_word == "take":
        # take it to the top
        idx = expect_word(source, idx, 'it', 'take it to the top', error_generator)
        idx = expect_word(source, idx, 'to', 'take it to the top', error_generator)
        idx = expect_word(source, idx, 'the', 'take it to the top', error_generator)
        idx = expect_word(source, idx, 'top', 'take it to the top', error_generator)

        return idx, datatypes.TokenType.ReservedContinue

    if first_word == "break":
        # could be break or break it down
        original_idx = idx
        idx, word = get_next_word(source, idx)
        if idx == original_idx or word != 'it':
            return original_idx, datatypes.TokenType.ReservedBreak

        idx = expect_word(source, idx, 'down', 'break it down', error_generator)

        return idx, datatypes.TokenType.ReservedBreak

    if first_word == "listen":
        # listen to
        original_idx = idx

        # to is optional
        idx, word = get_next_word(source, idx)
        if idx == original_idx or word != 'to':
            return original_idx, datatypes.TokenType.ReservedListen
        return idx, datatypes.TokenType.ReservedListenTo

    if first_word == "give":
        # give back
        idx = expect_word(source, idx, 'back', 'give back', error_generator)

        return idx, datatypes.TokenType.ReservedReturn

    if first_word == "ain":
        # ain't
        if source[idx:idx+2] == "'t":
            idx += 2
            return idx, datatypes.TokenType.ReservedNEQ

    match: Optional[datatypes.TokenType] = SINGLE_KEYWORDS.get(first_word)
    if match is not None:
        return idx, match

    return idx, datatypes.TokenType.Word


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

    tokens: datatypes.TokenStream = datatypes.TokenStream()

    while idx < src_length:
        start_idx = idx
        current_char = source[idx]
        error_func: ErrorGenerator = lambda msg, s_idx, e_idx: get_lexer_exception(msg, line, line_idx, s_idx, e_idx)

        if current_char.isspace() and current_char != '\n':
            idx = skip_whitespace(source, idx)

        elif current_char == '(':
            start_line = line
            start_line_idx = line_idx
            while idx < src_length and source[idx] not in ')':
                idx += 1
                if source[idx] == '\n':
                    line += 1
                    line_idx = idx

            if idx == src_length:
                location = datatypes.SourceLocation(start_line,
                                                    start_idx - start_line_idx + 1,
                                                    line,
                                                    idx - line_idx + 1)
                raise datatypes.LexerError("Unclosed comment", location=location, start_idx=start_idx, end_idx=idx)
            idx += 1  # skip ')'

        elif current_char.isnumeric() or \
                current_char == '-' or \
                (current_char == '.' and source[idx + 1].isnumeric()):
            idx, number = parse_number(source, idx, error_func)

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Number, data=number, location=location))

        elif current_char == '"':
            idx += 1 # move past starting quote
            while idx < src_length and source[idx] != '"':
                idx += 1
            idx += 1 # move past end quote
            location = get_srcloc(line, line_idx, start_idx, idx)

            if idx > src_length:
                raise datatypes.LexerError("Unclosed string", location=location, start_idx=start_idx, end_idx=idx)

            contents = source[start_idx + 1 : idx - 1]
            tokens.append(datatypes.Token(type=datatypes.TokenType.String, data=contents, location=location))

        elif current_char == '\n':
            old_column = idx - line_idx
            old_line = line

            idx += 1
            line += 1
            line_idx = idx

            location = datatypes.SourceLocation(old_line, old_column + 1, line, 1)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Newline, data=None, location=location))

        elif current_char == ',':
            idx += 1

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Comma, data=None, location=location))

        elif current_char == '.':
            idx += 1

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Period, data=None, location=location))

        elif source[idx:idx+2] == "'s":
            idx += 2

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.ReservedAssignment, data=None, location=location))

        elif current_char.isalpha():
            idx, symbol = word_symbolizer(source, idx, error_func)

            contents = source[start_idx:idx]
            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=symbol, data=contents, location=location))
        else:
            raise get_lexer_exception(f"Unknown symbol '{current_char}'.", line, line_idx, start_idx, start_idx + 1)

    return tokens
