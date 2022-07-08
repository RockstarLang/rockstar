const assert = require('chai').assert;
const path = require('path');
const fs = require('fs');
const satriani = require('../satriani.js');
const util = require('util');

describe('failure tests', function() {
    test_directory('../tests/failures/', execute_and_compare_error);
});

describe('feature tests', function() {
    var fixtures = fs.readdirSync('../tests/fixtures');
    fixtures.forEach(fixture => {
        test_directory(path.join('../tests/fixtures/', fixture), execute_and_compare_output);
    });
});

function test_directory(directory, predicate) {
    describe(directory, function () {
        var files = fs.readdirSync(directory);
        files.forEach(file => {
            if (/^\._/.test(file)) return; // skip ._ files that macOS drops all over some filesystems.
            if (! /\.rock$/.test(file)) return;
            it(file, function() {
                predicate(path.join(directory,file));
            });
        });
    });
}

function execute(source, inputs) {
    let result = "";
    // We pass arrays to util.inspect() here because we're looking for parity
    // with console.log so we can run nodejs on the console to verify
    // test behaviour.
    let output = function(s) { result += (Array.isArray(s) ? util.inspect(s) : String(s))  + "\n"; };
    let input = function() { return inputs.shift(); };
    let rockstar = new satriani.Interpreter();
    rockstar.run(source, input, output);
    return result;
}

function execute_and_compare_output(file) {
    let source = fs.readFileSync(file, 'utf8');
    let inputs = [];
    ['.in', '.in\''].forEach(ext => {
        let inputsFile = file + ext;
        if (fs.existsSync(inputsFile)) {
            inputs = fs.readFileSync(inputsFile, 'utf8').split(/\n/g);
            return;
        }
    });

    let targetFile = file + '.out';
    let target = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
    let actual = execute(source, inputs);
    target = target.replace(/\r/g, '');
    actual = actual.replace(/\r/g, '');
    assert.equal(actual, target);
}

function execute_and_compare_error(file) {
    let source = fs.readFileSync(file, 'utf8');
    let targetFile = file + '.err';
    let target = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
    assert.throws(function() { execute(source) }, Error, target);
}
