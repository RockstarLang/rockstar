import re

def run(code, env=None):
    token_regex = r'''\w+|\d+|'(?:[^']|\\')+'|"(?:[^"]|\\")+"|\n'''
    sentences = [[]]
    for word in re.findall(token_regex, code):
        if word == '\n':
            sentences.append([])
        else:
            sentences[-1].append(word)

    if env is None:
        env = {}

    while sentences:
        break


    print(sentences)
    exit()

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
    print('\n'.join(expected))
    result = []
    assert run(fizzbuzz, {'print': result.append}) == 'expected'