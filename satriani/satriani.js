const rockstar = require('./rockstar.js');
const environment = require('./environment.js');

module.exports = {
    Interpreter : function(output) {
        this.output = output;
        this.input = () => "";
        this.interpret = function (program) {
            let ast = this.parse(program);
            let g = new environment.Environment();
            g.output = this.output;
            g.readline = this.input;
            return g.run(ast);
        }

        this.parse = function(program) {
            let ast = rockstar.parse(program);
            return(ast);
        }
    }
};
