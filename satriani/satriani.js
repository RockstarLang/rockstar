const parser = require('./satriani.parser.js');
const interpreter = require('./satriani.interpreter.js');

module.exports = {
    Interpreter : function(output) {
        this.output = output;
        this.input = () => "";
        this.interpret = function (program) {
            if (typeof(program) == 'string') program = this.parse(program);
            let env = new interpreter.Environment();
            env.output = this.output;
            env.readline = this.input;
            return env.run(program);
        }

        this.parse = function(program) {
            let ast = parser.parse(program);
            return(ast);
        }
    }
};
