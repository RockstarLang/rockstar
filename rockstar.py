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

def parse_expression(text, env):
    """
    Run-of-the-mill text to value conversion.
    """
    # Rules are not well defined here. Just try our best.

    if text.isdigit():
        return lambda: int(text)
    if ' and ' in text:
        left_str, right_str = text.split(' and ')
        left = parse_expression(left_str, env)
        right = parse_expression(right_str, env)
        return lambda: left() and right()
    if ' or ' in text:
        left_str, right_str = text.split(' or ')
        left = parse_expression(left_str, env)
        right = parse_expression(right_str, env)
        return lambda: left() or right()
    if ' is higher than ' in text:
        left_str, right_str = text.split(' is higher than ')
        left = parse_expression(left_str, env)
        right = parse_expression(right_str, env)
        return lambda: left() > right()
    if ' is at least as high as ' in text:
        left_str, right_str = text.split(' is at least as high as ')
        left = parse_expression(left_str, env)
        right = parse_expression(right_str, env)
        return lambda: left() > right()
    if ' is ' in text:
        left_str, right_str = text.split(' is ')
        left = parse_expression(left_str, env)
        right = parse_expression(right_str, env)
        return lambda: left() == right()
    if ' taking ' in text:
        name, params_str = text.split(' taking ')
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
    if len(sentences) > 1 and sentences[1][1].startswith('And ') and sentences[1][1] != 'And around we go':
        body.append(parse_next_statement(sentences, env))
        while sentences:
            if not sentences[0][1].startswith('And '): break
            body.append(parse_next_statement(sentences, env))
    else:
        while sentences:
            if sentences[0][1] == '':
                break
            elif sentences[0][1] in ('And around we go', 'End'):
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
        sentence = re.sub('^And ', '', sentence)
        if sentence:
            break
    else:
        return (-1, ''), lambda: None

    first, rest = sentence.split(' ', 1) if ' ' in sentence else (sentence, '')
    if sentence.lower() in ('take it to the top', 'continue'):
        def run():
            raise Continue()
    elif sentence.lower() == 'break it down!':
        def run():
            raise Break()
    elif ' takes ' in sentence:
        name_str, fn = parse_function(sentence, sentences, env)
        name = parse_name(name_str, env)
        env[name] = fn
        run = lambda: None
    elif first == 'While':
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
    elif first == 'Until':
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
    elif first == 'If':
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
    elif first == 'Build':
        name_str, = re.fullmatch(r'Build (.+?) up', sentence).groups()
        name = parse_name(name_str, env)
        def run():
            env[name] += 1
    elif first == 'Build':
        name_str, = re.fullmatch(r'Build (.+?) up', sentence).groups()
        name = parse_name(name_str, env)
        def run():
            env[name] += 1
    elif first == 'Take':
        name_left_str, name_right_str = re.fullmatch(r'Take (.+?) from (.+?)', sentence).groups()
        name_left = parse_name(name_left_str, env)
        name_right = parse_name(name_right_str, env)
        def run():
            # Take VALUE from NAME
            env[name_right] -= env[name_left]
    else:
        for name, value in env.items():
            if callable(value) and sentence.startswith(name):
                expression = parse_expression(sentence.replace(name + ' ', ''), env)
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
    env = {'Whisper': print, 'Say': print, 'Shout': print, 'lineno': 0, 'nothing': 0}

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
    fizzbuzz1 = """
Midnight takes your heart and your soul
While your heart is higher than your soul
Take your soul from your heart
And around we go
Give back your heart

Desire is a lovestruck ladykiller
My world is nothing 
Fire is ice
Hate is water
Until my world is Desire,
Build my world up
If Midnight taking my world, Fire is Fire and Midnight taking my world, Hate is Hate
Shout "FizzBuzz!"
And take it to the top
If Midnight taking my world, Fire is Fire
Shout "Fizz!"
And take it to the top
If Midnight taking my world, Hate is Hate
Say "Buzz!"
And take it to the top
Whisper my world
And around we go
"""

    fizzbuzz2 = """
Modulus takes Number and Divisor
While Number is higher than Divisor
    Take Divisor from Number
End
Give back Number

Limit is 100
Counter is 0
Fizz is 3
Buzz is 5
Until Counter is Limit
    Build Counter up
    If Modulus taking Counter, Fizz is Fizz and Modulus taking Counter, Buzz is Buzz
        Say "FizzBuzz!"
        And Continue
    If Modulus taking Counter, Fizz is Fizz
        Say "Fizz!"
        And Continue
    If Modulus taking Counter, Buzz is Buzz
        Say "Buzz!"
        And Continue
    Say Counter
End
"""

    expected = ['Fizz' * (i%3==0) + 'Buzz' * (i%5==0) or str(i) for i in range(1, 101)]
    run(fizzbuzz1)