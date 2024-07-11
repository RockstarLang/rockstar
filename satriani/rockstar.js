const fs = require('fs');
const satriani = require('./satriani.js');
var readlineSync = require('readline-sync');
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const stdin_buffer = [];
let use_buffered_stdin = false;
rl.on('line', (line) => {
    use_buffered_stdin = true;
    stdin_buffer.push(line)
});

read_stdin = _ => (use_buffered_stdin ? stdin_buffer.shift() ?? "" : readlineSync.question());

var sourceFilePath = process.argv[2];
var watch = process.argv.filter(x => x.toLowerCase() === "--watch").length > 0;

function execute() {
    var rockstar = new satriani.Interpreter();
    fs.readFile(sourceFilePath, 'utf8', (err, data) => {
        if (err) throw err;
        try {
            let tree = rockstar.parse(data);
            let input = read_stdin;
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