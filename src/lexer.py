"""
Rockstar Reference Compiler's lexer. Turns a source file into an array of tokens which can then be parsed by the parser.
Entrypoint is lexer.lex()
"""
from typing import Callable, Tuple, Dict, Set, Optional
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


def parse_string(source: str, start_idx: int, error_generator: ErrorGenerator) -> Tuple[int, str]:
    """
    Parses a string starting from the opening quotation mark.

    :param source:                   String of the source file
    :param start_idx:                Index of the first character of the string, starting from the first quote
    :param error_generator:          Constructs a error to throw. Arguments (msg, start_idx, end_idx)
    :return:                         Tuple of the index of first character past the closing quote and the parsed string
    :raises datatypes.LexerError:    On unclosed string
    """
    src_length = len(source)
    idx = start_idx + 1 # move past starting quote
    while idx < src_length and source[idx] != '"':
        idx += 1
    idx += 1 # move past end quote

    if idx > src_length:
        raise error_generator("Unclosed string", start_idx, idx)

    contents = source[start_idx + 1 : idx - 1]
    return idx, contents


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
    'taking': datatypes.TokenType.ReservedTaking,
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
    'says': datatypes.TokenType.ReservedSays,
    'are': datatypes.TokenType.ReservedAssignment,
    'was': datatypes.TokenType.ReservedAssignment,
    'were': datatypes.TokenType.ReservedAssignment,
    'thinks': datatypes.TokenType.ReservedExprAssignment,
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

# Set of token types that represent type constants
TYPE_CONSTANT_SYMBOLS: Set[datatypes.TokenType] = {
    datatypes.TokenType.Null,
    datatypes.TokenType.BooleanTrue,
    datatypes.TokenType.BooleanFalse,
    datatypes.TokenType.Mysterious
}

# Set of token types that can be used for writing variables.
VARIABLE_SYMBOLS: Set[datatypes.TokenType] = {
    datatypes.TokenType.ReservedCommonVar,
    datatypes.TokenType.Pronoun,
    datatypes.TokenType.Word
}

# Set of token types that begin a poetic string assignment.
POETIC_STRING_ASSIGNMENT_SYMBOLS: Set[datatypes.TokenType] = {
    datatypes.TokenType.ReservedSays
}

# Set of token types that begin a poetic literal or number assignment.
POETIC_ASSIGNMENT_SYMBOLS: Set[datatypes.TokenType] = {
    datatypes.TokenType.ReservedAssignment,
    datatypes.TokenType.ReservedIs
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


def try_type_literal_assignment(source: str, line: int, line_start: int,
                                start_idx: int, error_func: ErrorGenerator) -> Optional[Tuple[int, datatypes.Token]]:
    """
    Assuming we've started a poetic type literal or number assignment, attempt to tokenize
    the remainder of the line as a type literal - a string literal, number literal, boolean, null, or mysterious.
    Indicates whether the rest of the line was successfully tokenized so that the caller
    can determine how to proceed. It is an error for a poetic type literal assignment to
    include words after the type literal.

    :param source:                   String of the source file
    :param line:                     Index of the line in the source file, used to construct location
    :param line_start:               Index of the first character in this line, used to construct location
    :param start_idx:                The index in the source file to start tokenizing from
    :param error_func:               Constructs an error to throw. Arguments (msg, start_idx, end_idx)
    :return:                         If successful, tuple containing next index to tokenize from and token produced.
                                     Otherwise, returns None.
    :raises datatypes.LexerError:    On text that looked like it was a number or string but failed to parse correctly,
                                     as well as when extra text follows the poetic type literal.
    """
    idx = skip_whitespace(source, start_idx)
    current_char = source[idx]
    error_message = "Nothing else can follow poetic type literal assignment"

    # If the start looks like a number, assume we're matching a number
    if current_char.isnumeric() or current_char == '-' or current_char == '.':
        idx, number = parse_number(source, idx, error_func)
        location = get_srcloc(line, line_start, start_idx, idx)
        idx = skip_whitespace(source, idx)

        if source[idx] != "\n":
            raise error_func(error_message, start_idx, idx)

        return idx, datatypes.Token(type=datatypes.TokenType.Number, data=number, location=location)

    # If the start looks like a string, assume we're matching a string
    if current_char == '"':
        idx, string = parse_string(source, idx, error_func)
        location = get_srcloc(line, line_start, start_idx, idx)
        idx = skip_whitespace(source, idx)

        if source[idx] != "\n":
            raise error_func(error_message, start_idx, idx)

        return idx, datatypes.Token(type=datatypes.TokenType.String, data=string, location=location)

    idx, first_word = get_next_word(source, idx)
    match: Optional[datatypes.TokenType] = SINGLE_KEYWORDS.get(first_word)
    # If this is a poetic type literal assignment, just match that
    if match is not None and match in TYPE_CONSTANT_SYMBOLS:
        location = get_srcloc(line, line_start, start_idx, idx)
        contents = source[start_idx:idx]
        idx = skip_whitespace(source, idx)

        if source[idx] != "\n":
            raise error_func(error_message, start_idx, idx)

        return idx, datatypes.Token(type=match, data=contents, location=location)

    return None


def tokenize_poetic_assignment(source: str, line: int, line_start: int,
                               start_idx: int, error_func: ErrorGenerator) -> Tuple[int, datatypes.Token]:
    """
    Assuming we've started a poetic type literal or poetic number assignment, attempt to tokenize
    the remainder of the line as a type literal or poetic number. It is an error for a
    poetic type literal assignment to include words after the type literal.

    :param source:                   String of the source file
    :param line:                     Index of the line in the source file, used to construct location
    :param line_start:               Index of the first character in this line, used to construct location
    :param start_idx:                The index in the source file to start tokenizing from
    :param error_func:               Constructs an error to throw. Arguments (msg, start_idx, end_idx)
    :return:                         Tuple containing the next index to tokenize from and the token produced
    :raises datatypes.LexerError:    On text that looked like it was a number or string but failed to parse correctly,
                                     as well as when extra text follows the poetic type literal.
    """
    # At this point we don't know if this is a poetic type literal assignment or a
    # poetic number assignment. To figure it out, we try to tokenize the first word
    # as a type literal. If it fails, it must be a poetic number assignment.
    result = try_type_literal_assignment(source, line, line_start, start_idx, error_func)
    if result is not None:
        return result

    source_length = len(source)
    idx = start_idx
    current_word_length = 0
    # The characters that make up the number being represented.
    number_characters = []
    added_decimal_point = False

    # Helper function for adding a new digit to number_characters.
    # Does nothing if there are no new characters.
    def try_add_digit() -> None:
        if current_word_length > 0:
            number_characters.append(str(current_word_length % 10))

    while idx < source_length and source[idx] != "\n":
        current_char = source[idx]
        # If it's a space, add the current word length mod 10 (if any) and reset
        if current_char.isspace():
            try_add_digit()
            current_word_length = 0

        # If its a letter, increment the current word length
        elif current_char.isalpha():
            current_word_length += 1

        # If its a decimal point and we haven't added one, add a decimal
        # point and start a new word
        elif current_char == "." and not added_decimal_point:
            try_add_digit()
            current_word_length = 0
            number_characters.append(".")
            added_decimal_point = True

        idx += 1

    try_add_digit()

    # Create the string representing the entire number by joining the
    # individual characters. If there are none, the number will be 0.
    number_string = "".join(number_characters) or "0"
    location = get_srcloc(line, line_start, start_idx, idx)
    value = datatypes.Number(number_string)
    token = datatypes.Token(type=datatypes.TokenType.Number, data=value, location=location)

    return idx, token


def tokenize_poetic_string_assignment(source: str, line: int,
                                      line_start: int, start_idx: int) -> Tuple[int, datatypes.Token]:
    """
    Assuming we've started a poetic string assignment, tokenize the rest of the line
    (up to but not including the newline character) as a string.

    :param source:                   String of the source file
    :param line:                     Index of the line in the source file, used to construct location
    :param line_start:               Index of the first character in this line, used to construct location
    :param start_index:              The index in the source file to start tokenizing from
    :return:                         Tuple containing the next index to tokenize from and the token produced
    """
    source_length = len(source)
    idx = start_idx

    while idx < source_length and source[idx] != "\n":
        idx += 1

    contents = source[start_idx:idx]
    location = get_srcloc(line, line_start, start_idx, idx)

    return idx, datatypes.Token(type=datatypes.TokenType.String, data=contents, location=location)


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

    seen_keyword_on_line: bool = False

    tokens: datatypes.TokenStream = []

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

        elif current_char.isnumeric() or current_char == '-' or current_char == '.':
            idx, number = parse_number(source, idx, error_func)

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Number, data=number, location=location))

        elif current_char == '"':
            idx, string = parse_string(source, idx, error_func)
            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.String, data=string, location=location))

        elif current_char == '\n':
            old_column = idx - line_idx
            old_line = line

            idx += 1
            line += 1
            line_idx = idx
            seen_keyword_on_line = False

            location = datatypes.SourceLocation(old_line, old_column + 1, line, 1)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Newline, data=None, location=location))

        elif current_char == ',':
            idx += 1

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.Comma, data=None, location=location))

        elif source[idx:idx+2] == "'s":
            idx += 2

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.ReservedAssignment, data=None, location=location))
            if not seen_keyword_on_line:
                idx, token = tokenize_poetic_assignment(source, line, line_idx, idx, error_func)
                tokens.append(token)
            seen_keyword_on_line = True

        elif source[idx:idx+3] == "'n'":
            idx += 3

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.ArgumentSeparator, data=None, location=location))

        elif current_char == '&':
            idx += 1

            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=datatypes.TokenType.ArgumentSeparator, data=None, location=location))

        elif current_char.isalpha():
            idx, symbol = word_symbolizer(source, idx, error_func)
            contents = source[start_idx:idx]
            location = get_srcloc(line, line_idx, start_idx, idx)
            tokens.append(datatypes.Token(type=symbol, data=contents, location=location))
            # Poetic assignments always start with variables, so if we've seen a keyword
            # we shouldn't treat this as a poetic assignment.
            if not seen_keyword_on_line:
                if symbol in POETIC_ASSIGNMENT_SYMBOLS:
                    idx, token = tokenize_poetic_assignment(source, line, line_idx, idx, error_func)
                    tokens.append(token)
                    seen_keyword_on_line = True
                elif symbol in POETIC_STRING_ASSIGNMENT_SYMBOLS:
                    if (not source[idx].isspace()) or source[idx] == "\n":
                        raise datatypes.LexerError("Poetic string assignment must be followed by a space",
                                                   location=location, start_idx=start_idx, end_idx=idx)
                    # skip over the space with idx + 1
                    idx, token = tokenize_poetic_string_assignment(source, line, line_idx, idx + 1)
                    tokens.append(token)
                    seen_keyword_on_line = True
                elif symbol not in VARIABLE_SYMBOLS:
                    seen_keyword_on_line = True
        else:
            raise get_lexer_exception(f"Unknown symbol '{current_char}'.", line, line_idx, start_idx, start_idx + 1)

    return tokens
