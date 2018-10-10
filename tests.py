from typing import List
import argparse
import glob
import os
import subprocess
import sys


def run_command(command: List[str], infile: str) -> bool:
    input_file = infile + ".in'"
    output_file = infile + ".out"

    if os.path.exists(input_file):
        in_contents = open(input_file, 'rb').read()
    else:
        in_contents = None

    if os.path.exists(output_file):
        out_contents = open(output_file, 'rb').read()
    else:
        out_contents = None

    process = subprocess.run([*command, infile], input=in_contents, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if process.returncode != 0:
        print(f"Error running file {infile}.", file=sys.stderr)
        print(f"stdout: ", file=sys.stderr)
        print(process.stdout.decode("utf-8"), file=sys.stderr)
        print(f"stderr: ", file=sys.stderr)
        print(process.stderr.decode("utf-8"), file=sys.stderr)

    return process.returncode == 0


def main() -> int:
    # One day this will be generic to allow testing arbitrary implementations
    parser = argparse.ArgumentParser()
    parser.add_argument("--ignore", nargs="+", help="Ignore these test inputs.")
    args = parser.parse_args()

    ignored: List[str] = list(map(os.path.normpath, args.ignore))

    command = [sys.executable, "src/rockstar.py"]

    all_inputs = set(map(os.path.normpath, glob.glob("tests/**/*.rock", recursive=True)))

    inputs = all_inputs - set(ignored)

    results = [run_command(command, infile) for infile in inputs]

    if all(results):
        print(f"All {len(results)} succeeded!")
        return 0
    else:
        failed_tests = sum([1 for r in results if not r])
        print(f"{failed_tests} test(s) failed.")
        return 1


if __name__ == '__main__':
    exit(main())
