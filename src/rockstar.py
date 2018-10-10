"""
Main function and entry point into the Rockstar Reference Compiler
"""
import argparse
import sys

import lexer
import datatypes


def main() -> int:
    arg_parser = argparse.ArgumentParser(description='Rockstar reference interpreter')
    arg_parser.add_argument('source', type=argparse.FileType('r'), help='source file')
    args = arg_parser.parse_args()

    try:
        source = args.source.read()
        token_stream = lexer.lex(source)
        for token in token_stream:
            print(f"{token.type}\t"
                  f"{token.data}\t"
                  f"{token.location.line_start}\t"
                  f"{token.location.char_start}\t"
                  f"{token.location.line_end}\t"
                  f"{token.location.char_end}")
    except datatypes.RockstarError as err:
        print(f"Error: "
              f"{err.location.line_start}:{err.location.char_start} - {err.location.line_end}:{err.location.char_end}: "
              f"{err}",
              file=sys.stderr)
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
