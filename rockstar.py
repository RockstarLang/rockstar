import re
import random
import string
from pprint import pprint

random_name = lambda: ''.join(random.choice(string.ascii_uppercase) for i in range(10))
unescape_string = lambda string: string[1:-1].replace('\\n', '\n').replace('\\t', '\t').replace('\\\'', '\'').replace('\\"', '"')

def extract_strings(code):
    strings = {}
    def replace(match):
        name = random_name()
        strings[name] = unescape_string(match.string[match.span()[0]:match.span()[1]])
        return name
    return re.sub(r'"([^"]|\\")*?"|\'([^\']|\\\')*?\'', replace, code), strings

def parse_name(name, env):
    name = name.lower()
    if name in ('it', 'he', 'she', 'him', 'her', 'them', 'they'):
        return env['_']
    env['_'] = name
    return name

def parse_function(first_line, sentences, env):
    name, params_str = first_line.split(' takes ')
    params = [parse_name(param, env) for param in params_str.split(' and ')]
    body = []
    while sentences:
        if not sentences[0].strip(): break
        body.append(parse_next(sentences, env))
    def run(*args):
        for name, arg in zip(params, args):
            env[name] = arg
        for statement in body:
            result = statement()
            if result is not None:
                return result
    return name, run

def parse_expression(text, env):
    # Rules are not well defined here. Just try our best.
    name = parse_name(text, env)
    if name in env:
        return env[name]
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
    if ' is ' in text:
        left_str, right_str = text.split(' is ')
        left = parse_expression(left_str, env)
        right = parse_expression(right_str, env)
        return lambda: left() == right()
    if ' taking ' in text:
        name, params = text.split(' taking ')
        fn = parse_expression(name, env)
        params = [parse_expression(param, env) for param in params.split(', ')]
        return lambda: fn()(*(param() for param in params))
    raise ValueError('Failed to eval expression: ' + repr(text))

def parse_block(sentences, env):
    body = []
    if not sentences[0].startswith('And '):
        while sentences:
            if sentences[0].strip() == 'And around we go':
                sentences.pop(0)
                break
            body.append(parse_next(sentences, env))
    else:
        while sentences:
            if not sentences[0].startswith('And '): break
            body.append(parse_next(sentences, env))
    return body

class Continue(Exception): pass
class Break(Exception): pass

def parse_next(sentences, env):
    while True:
        sentence = re.sub('^And ', '', sentences.pop(0).strip(' ,'))
        if sentence:
            break

    first, rest = sentence.split(' ', 1)
    if 'ake it to the top' in sentence:
        def run():
            raise Continue()
        return run
    elif sentence == 'Break it down!':
        def run():
            raise Break()
        return run
    elif ' takes ' in sentence:
        name_str, fn = parse_function(sentence, sentences, env)
        name = parse_name(name_str, env)
        env[name] = fn
        return lambda: None
    elif first == 'While':
        body = parse_block(sentences, env)
        expression = parse_expression(rest, env)
        def run():
            while expression():
                for fn in body:
                    fn(env)
        return run
    elif first == 'Until':
        body = parse_block(sentences, env)
        expression = parse_expression(rest, env)
        def run():
            while not expression():
                for fn in body:
                    fn()
        return run
    elif first == 'If':
        body = parse_block(sentences, env)
        expression = parse_expression(rest, env)
        def run():
            if expression():
                for fn in body:
                    fn(env)
        return run
    elif sentence.startswith('Give back'):
        expression = sentence.replace('Give back', '')
        def run():
            return eval_expression(expression, env)
        return run
    elif ' is ' in sentence:
        # This "elif" must be after conditional blocks due to =\== ambiguity.
        name_str, words = re.fullmatch(r'(.+?) is (.+?)', sentence).groups()
        if words in ('nothing', 'nowhere', 'nobody'):
            value = 0
        else:
            value = int(''.join(str(len(word)%10) for word in words.replace('.', ' .').split()))
        name = parse_name(name_str, env)
        def run():
            env[name] = value
        return run
    elif first == 'Build':
        name_str, = re.fullmatch(r'Build (.+?) up', sentence).groups()
        name = parse_name(name_str, env)
        def run():
            env[name] += 1
        return run
    elif first == 'Build':
        name_str, = re.fullmatch(r'Build (.+?) up', sentence).groups()
        name = parse_name(name_str, env)
        def run():
            env[name] += 1
        return run
    elif first == 'Take':
        name_left_str, name_right_str = re.fullmatch(r'Take (.+?) from (.+?)', sentence).groups()
        name_left = parse_name(name_left_str, env)
        name_right = parse_name(name_right_str, env)
        def run():
            env[name_left] -= name_right
        return run
    else:
        for name, value in env.items():
            if callable(value) and sentence.startswith(name):
                expression = sentence.replace(name + ' ', '')
                def run():
                    value(env, eval_expression(expression, env))
                return run
        raise ValueError('Parse error: ' + repr(sentence))

def parse(code):
    _print = lambda env, arg: print(arg)
    env = {'Whisper': _print, 'Say': _print, 'Shout': _print}

    # Replace all literal strings with constants so we can do nasty string
    # operations during parsing.
    code, strings = extract_strings(code)
    env.update(strings)
    env['_'] = None


    sentences = code.split('\n')
    statements = []
    while sentences:
        statements.append(parse_next(sentences, env))

    return statements

def run(code):
    for statement in parse(code):
        statement()

if __name__ == '__main__':
    fizzbuzz = """Midnight takes your heart and your soul
While your heart is higher than your soul
Take your soul from your heart
Give back your heart

Desire is a lovestruck ladykiller
My world is nothing
Fire is ice
Hate is water
Until my world is Desire,
Build my world up
If Midnight taking Desire, Fire is nothing and Midnight taking Desire, Hate is nothing
Shout "FizzBuzz!"
And take it to the top
If Midnight taking Desire, Fire is nothing
Shout "Fizz!"
And take it to the top
If Midnight taking Desire, Hate is nothing
Say "Buzz!"
And take it to the top
Whisper my world
And around we go"""

    expected = ['Fizz' * (i%3==0) + 'Buzz' * (i%5==0) or str(i) for i in range(1, 101)]
    run(fizzbuzz)

    run('Whisper "test"')