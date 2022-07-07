const parser = require('./satriani.parser.js');
const interpreter = require('./satriani.interpreter.js');
const path = require('path');

module.exports = {
    Interpreter : function() {
        this.run = function(program, input, output, file) {
            if (typeof(program) == 'string') program = this.parse(program);
            let env = new interpreter.Environment();
            env.output = output || console.log;
            env.input = input || (() => "");
            if (file == undefined) {
                file = path.join(__dirname, "anonymous.rock");
            }
            file = path.resolve(file);// Absolute path
            env.assign("thy_location", file, null, 1);
            return env.run(program);
        }

        this.parse = function(program) {
            return parser.parse(program);
        }
    }
};
