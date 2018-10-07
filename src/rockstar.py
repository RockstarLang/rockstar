"""
Main function and entry point into the Rockstar Reference Compiler
"""
import argparse


def main() -> None:
    arg_parser = argparse.ArgumentParser(description='Rockstar reference interpreter')
    arg_parser.add_argument('source', type=str, help='source file')
    args = arg_parser.parse_args()

    print(args.source)


if __name__ == '__main__':
    main()
