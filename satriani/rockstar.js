const fs = require('fs');
const satriani = require('./satriani.js');
var readlineSync = require('readline-sync');

var sourceFilePath = process.argv[2];
var watch = process.argv.filter(x => x.toLowerCase() === "--watch").length > 0;

function execute() {
    var rockstar = new satriani.Interpreter();
    fs.readFile(sourceFilePath, 'utf8', (err, data) => {
        if (err) throw err;
        try {
            let tree = rockstar.parse(data);
            let input = readlineSync.question;
            let output = console.log;
            let result = rockstar.run(tree, input, output)
            console.log(result ? result : "(program returned no output)");
        } catch (e) {
            if (e.location && e.location.start) {
                let lines = data.split(/\n/);
                console.log(lines[e.location.start.line - 1]);
                console.log(' '.repeat(e.location.start.column - 1) + '^');
                console.log(e.message);
                console.log(sourceFilePath + " line " + e.location.start.line + " col " + e.location.start.column);
            } else {
                console.log(e);
            }

        }
    });
}

if (!sourceFilePath) {
    console.log('No source file specified');
    console.log('Usage: node rockstar.js program.rock');
} else {
    execute();
    if (watch) {
        fs.watch(sourceFilePath, execute);
    }
}