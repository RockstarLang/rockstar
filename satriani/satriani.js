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
            return parser.parse(program);
        }
    }
};
