const fs = require('fs');
const rockstar = require('./rockstar.js');

var sourceFilePath = process.argv[2];
fs.readFile(sourceFilePath, 'utf8', (err, data) => {;
    if (err) throw err;
    try {
        let tree = rockstar.parse(data);
        console.log(JSON.stringify(tree,null,2));
    } catch (e) {
        console.log(JSON.stringify(e,null,2));
    }
});