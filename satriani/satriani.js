const parser = require('./satriani.parser.js');
const interpreter = require('./satriani.interpreter.js');

module.exports = {
    Interpreter : function() {
        this.run = function(program, input, output) {
            if (typeof(program) == 'string') program = this.parse(program);
            let env = new interpreter.Environment();
            env.output = output || console.log;
            env.input = input || (() => "");
            return env.run(program);
        }

        this.parse = function(program) {
            // In Rockstar, the end-of-file (EOF) implicitly closes any open blocks and loops
            // This is surprisingly difficult to implement in a parsing expression
            // grammar - probably because EOF isn't something the parser can 'consume'
            // So... we stick a load of extra newlines onto the program before we pass
            // it to the parser. It's hacky as all hell - and won't work if you're >8 blocks
            // deep when we reach the EOF - but it works. :)
            return parser.parse(program + "\n\n\n\n\n\n\n\n");
        }
    }
};
