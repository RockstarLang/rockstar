import argparse
import datatypes
import lexer


def main():
    arg_parser = argparse.ArgumentParser(description='Rockstar reference interpreter')
    arg_parser.add_argument('source', type=str, help='source file')
    args = arg_parser.parse_args()

    print(args.source)


if __name__ == '__main__':
    main()
