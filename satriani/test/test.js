var assert = require('chai').assert;

var path = require('path');

const fs = require('fs');
var satriani = require('../satriani.js');

describe('failure tests', function() {
    test_directory('test/failures/', execute_and_compare_error);
});

describe('feature tests', function() {
    var fixtures = fs.readdirSync('test/fixtures');
    fixtures.forEach(fixture => {
        test_directory(path.join('test/fixtures/', fixture), execute_and_compare_output);
    });
});

function test_directory(directory, predicate) {
    describe(directory, function () {
        var files = fs.readdirSync(directory);
        files.forEach(file => {
            if (! /\.rock$/.test(file)) return;
            it(file, function() {
                predicate(path.join(directory,file));
            });
        });
    });
}

function execute(source, inputs) {
    let result = "";
    let interpreter = new satriani.Interpreter(function(s) { result += String(s)  + "\n"; });
    interpreter.input = () => inputs.shift();
    interpreter.interpret(source);
    return result;
}


function execute_and_compare_output(file) {
    let source = fs.readFileSync(file, 'utf8');
    let inputsFile = file + '.in';
    let inputs = (fs.existsSync(inputsFile) ? fs.readFileSync(inputsFile, 'utf8').split(/\n/g) : '');
    let targetFile = file + '.out';
    let target = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
    let actual = execute(source, inputs);
    assert.equal(actual, target);
}



function execute_and_compare_error(file) {
    let source = fs.readFileSync(file, 'utf8');
    let targetFile = file + '.err';
    let target = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
    assert.throws(function() { execute(source) }, Error, target);
}
