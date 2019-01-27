const fs = require('fs');
const rockstar = require('./rockstar.js');
const environment = require('./environment.js');
var readlineSync = require('readline-sync');

var sourceFilePath = process.argv[2];
fs.readFile(sourceFilePath, 'utf8', (err, data) => {;
    if (err) throw err;
    try {
        let program = rockstar.parse(data);
        console.log(JSON.stringify(program, null, 2));
        console.log('---------------------------------------------------');

        let env = new environment.Environment();
        env.readline = readlineSync.question;

        // env.output = (...args) => console.log(args);
        console.log(env.run(program));
        // console.log(JSON.stringify(tree,null,2));
    } catch (e) {
        if (e.location && e.location.start) {
            var lines = data.split(/\n/);
            console.log(lines[e.location.start.line - 1]);
            console.log(' '.repeat(e.location.start.column - 1) + '^');
            console.log(e.message);
            console.log(sourceFilePath + " line " + e.location.start.line + " col " + e.location.start.column);
        } else {
            console.log(e);
        }

    }
});