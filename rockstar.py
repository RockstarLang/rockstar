import re
import random
import string
from pprint import pprint

random_name = lambda: 'my ' + ''.join(random.choice(string.ascii_lowercase) for i in range(10))
unescape_string = lambda string: string[1:-1].replace('\\n', '\n').replace('\\t', '\t').replace('\\\'', '\'').replace('\\"', '"')

def extract_strings(code):
    """
    Replaces all literal strings in the given code with constants, returning
    the replaced code and the table of constants. This way we don't have to
    worry about string literals matching keywords and stuff. Dirty, I know
    but works oh so well.
    """
    strings = {}
    def replace(match):
        name = random_name()
        strings[name] = unescape_string(match.string[match.span()[0]:match.span()[1]])
        return name
    return re.sub(r'"([^"]|\\")*?"|\'([^\']|\\\')*?\'', replace, code), strings

def parse_name(name, env):
    """
    Normalizes a name. This function is stateful because the language is crazy.
    """
    name = name.lower()
    if name in ('it', 'he', 'she', 'him', 'her', 'them', 'they'):
        return env['_']
    env['_'] = name
    return name

def parse_function(first_line, sentences, env):
    """
    Given the first line of the function declaration, consumes sentences until
    it has finished parsing the rest of the body, and returns the function name
    and callable body.
    """
    function_name, params_str = first_line.split(' takes ')
    separator = ', ' if ', ' in params_str else ' and '
    params = [parse_name(param, env) for param in params_str.split(separator)]
    body = parse_block(sentences, env)
    def run(*values):
        if len(params) != len(values):
            raise ValueError(f'Mismatch of number of arguments for function {function_name  }: expected {len(params)} ({params}) and got {len(values)} ({values}).')
        for name, arg in zip(params, values):
            env[name] = arg
        return run_body(body)
    return function_name, run

binops = {
    ' and ': lambda left, right: lambda: left() and right(),
    ' or ': lambda left, right: lambda: left() or right(),

    ' is as high as ': lambda left, right: lambda: left() >= right(),
    ' is as great as ': lambda left, right: lambda: left() >= right(),
    ' is as big as ': lambda left, right: lambda: left() >= right(),
    ' is as strong as ': lambda left, right: lambda: left() >= right(),

    ' is as low as ': lambda left, right: lambda: left() <= right(),
    ' is as little as ': lambda left, right: lambda: left() <= right(),
    ' is as small as ': lambda left, right: lambda: left() <= right(),
    ' is as weak as ': lambda left, right: lambda: left() <= right(),

    ' is higher than ': lambda left, right: lambda: left() > right(),
    ' is greater than ': lambda left, right: lambda: left() > right(),
    ' is bigger than ': lambda left, right: lambda: left() > right(),
    ' is stronger than ': lambda left, right: lambda: left() > right(),

    ' is lower than ': lambda left, right: lambda: left() < right(),
    ' is less than ': lambda left, right: lambda: left() < right(),
    ' is smaller than ': lambda left, right: lambda: left() < right(),
    ' is weaker than ': lambda left, right: lambda: left() < right(),

    # Note that this relies on ordered dicts.
    ' is ': lambda left, right: lambda: left() == right(),

    ' plus ': lambda left, right: lambda: left() + right(),
    ' with ': lambda left, right: lambda: left() + right(),
    ' minus ': lambda left, right: lambda: left() - right(),
    ' without ': lambda left, right: lambda: left() - right(),
    ' times ': lambda left, right: lambda: left() * right(),
    ' of ': lambda left, right: lambda: left() * right(),
    ' over ': lambda left, right: lambda: left() / right(),
}
def parse_expression(text, env):
    """
    Run-of-the-mill text to value conversion.
    """
    # Rules are not well defined here. Just try our best.

    if text.isdigit():
        return lambda: int(text)

    for separator, fn in binops.items():
        if separator in text:
            left_str, right_str = text.split(separator, 1)
            left = parse_expression(left_str, env)
            right = parse_expression(right_str, env)
            return fn(left, right)

    if text.startswith('not '):
        rest = parse_expression(text[4:])
        return lambda: not rest()

    if ' taking ' in text:
        name, params_str = text.split(' taking ', 1)
        fn = parse_expression(name, env)
        params = [parse_expression(param, env) for param in params_str.split(', ')]
        return lambda: fn()(*(param() for param in params))

    name = parse_name(text, env)
    return lambda: env[name]

def parse_block(sentences, env):
    """
    Consumes sentences until the block ends, then returns the block.
    """
    body = []
    while sentences:
        if not sentences[0][1]:
            sentences.pop(0)
            break
        body.append(parse_next_statement(sentences, env))
    return body

# Use Python's Exception system for operations that interrupt control flow.
class Continue(Exception): pass
class Break(Exception): pass
class Return(Exception):
    def __init__(self, value):
        self.value = value

def parse_next_statement(sentences, env):
    """
    Consumes as many sentences as necessary to return a single well defined
    statement.
    """
    while sentences:
        lineno, sentence = sentences.pop(0)
        if sentence:
            break

    first, rest = sentence.split(' ', 1) if ' ' in sentence else (sentence, '')
    first = first.lower()
    if sentence.lower() in ('take it to the top', 'continue'):
        def run():
            raise Continue()
    elif sentence.lower() in ('break it down!', 'break'):
        def run():
            raise Break()
    elif ' takes ' in sentence:
        name_str, fn = parse_function(sentence, sentences, env)
        name = parse_name(name_str, env)
        env[name] = fn
        run = lambda: None
    elif first == 'while':
        body = parse_block(sentences, env)
        expression = parse_expression(rest, env)
        def run():
            while expression():
                try:
                    run_body(body)
                except Continue:
                    continue
                except Break:
                    break
    elif first == 'until':
        body = parse_block(sentences, env)
        expression = parse_expression(rest, env)
        def run():
            while not expression():
                try:
                    run_body(body)
                except Continue:
                    continue
                except Break:
                    break
    elif first == 'if':
        body = parse_block(sentences, env)
        expression = parse_expression(rest, env)
        def run():
            if expression():
                run_body(body)
    elif sentence.startswith('Give back '):
        expression = parse_expression(sentence.replace('Give back ', ''), env)
        def run():
            raise Return(expression())
    elif ' is ' in sentence:
        # This "elif" must be after conditional blocks due to =\== ambiguity.
        name_str, words = re.fullmatch(r'(.+?) is (.+?)', sentence).groups()
        if words in ('nothing', 'nowhere', 'nobody'):
            value = 0
        elif words.isdigit():
            value = int(words)
        else:
           value = int(''.join(str(len(word)%10) for word in words.replace('.', ' .').split()))
        name = parse_name(name_str, env)
        def run():
            env[name] = value
    elif first == 'put':
        value_str, name_str = re.fullmatch(r'Put (.+?) into (.+?)', sentence, flags=re.IGNORECASE).groups()
        expression = parse_expression(value_str, env)
        name = parse_name(name_str, env)
        def run():
            env[name] = expression()
    elif first == 'build':
        name_str, = re.fullmatch(r'Build (.+?) up', sentence, flags=re.IGNORECASE).groups()
        name = parse_name(name_str, env)
        def run():
            env[name] += 1
    elif first == 'knock':
        name_str, = re.fullmatch(r'Knock (.+?) down', sentence, flags=re.IGNORECASE).groups()
        name = parse_name(name_str, env)
        def run():
            env[name] -= 1
    elif first == 'take':
        name_left_str, name_right_str = re.fullmatch(r'Take (.+?) from (.+?)', sentence, flags=re.IGNORECASE).groups()
        name_left = parse_name(name_left_str, env)
        name_right = parse_name(name_right_str, env)
        def run():
            # Take VALUE from NAME
            env[name_right] -= env[name_left]
    elif first == 'listen':
        name_str = re.fullmatch(r'Listen to (.+?)', sentence, flags=re.IGNORECASE).groups()
        name = parse_name(name, env)
        def run():
            env[name] = input()
    else:
        for name, value in env.items():
            if callable(value) and sentence.lower().startswith(name):
                expression = parse_expression(sentence[len(name)+1:], env)
                def run():
                    value(expression())
                break
        else:
            raise ValueError(f'Parse error on line {lineno}: unrecognized sentence ' + repr(sentence))

    # Keep line number and sentence text to help debugging.
    return (lineno, sentence), run

def parse(code):
    """
    Translates source code into a list of runnable statements (with debugging
    metadata).
    """
    env = {
        'whisper': print,
        'say': print,
        'shout': print,
        'scream': print,

        'nothing': 0,
        'nowhere': 0,
        'noone': 0,

        'true': True,
        'yes': True,
        'right': True,
        'ok': True,

        'false': False,
        'no': False,
        'wrong': False,
        'no': False,
        'lies': False
    }

    # Replace all literal strings with constants so we can do nasty string
    # operations during parsing.
    code, strings = extract_strings(code)
    env.update(strings)
    env['_'] = None

    sentences = list(enumerate([sentence.strip(' ,') for sentence in code.split('\n')], start=1))
    statements = []
    while sentences:
        statements.append(parse_next_statement(sentences, env))
    return statements

def run_body(body):
    for (lineno, sentence), statement in body:
        #print('=', lineno, sentence)
        try:
            statement()
        except Return as e:
            return e.value
    
def run(code):
    run_body(parse(code))

if __name__ == '__main__':
    fizzbuzz = """
Midnight takes your heart and your soul
While your heart is as high as your soul
Put your heart without your soul into your heart

Give back your heart


Desire is a lovestruck ladykiller
My world is nothing 
Fire is ice
Hate is water
Until my world is Desire,
Build my world up
If Midnight taking my world, Fire is nothing and Midnight taking my world, Hate is nothing
Shout "FizzBuzz!"
Take it to the top

If Midnight taking my world, Fire is nothing
Shout "Fizz!"
Take it to the top

If Midnight taking my world, Hate is nothing
Say "Buzz!"
Take it to the top

Whisper my world
"""

    import sys
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            run(f.read())
    else:
        expected = ['Fizz' * (i%3==0) + 'Buzz' * (i%5==0) or str(i) for i in range(1, 101)]
        run(fizzbuzz)