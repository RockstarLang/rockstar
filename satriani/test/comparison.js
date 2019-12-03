const interpreter = require('../satriani.interpreter.js');
const assert = require('chai').assert;

let tests = [
    [true, true, true],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    ["5",    5, true],
    ["05.0", 5, true],
    ["5.0",  5, true],
    ["-10",  -10, true],
    [false, null, true],
    [true, null, false],
    [0, null, true],
    [1, null, false],
    [undefined, undefined, true],
    [undefined, 1, false],
    [undefined, 0, true],
    [undefined, null, true],
    [false,5,false],
    [5,false,false],
    [false,0,true],
    [0,false,true],
    ["true", true, true],
    ["lies", true, true],
    ["false", true, true],
    ["", false, true],
    ["", true, false],
    ["hello", "hello", true],
    ["hello","world", false]
];

describe('comparison tests', function() {
    tests.forEach(test => {
        let lhs = test[0];
        let rhs = test[1];
        let out = test[2];
        it(typeof (lhs) + ':' + JSON.stringify(lhs) + ' ' + (out  ? '==' : '!=') + ' ' + typeof (rhs) + ':' + JSON.stringify(rhs), function () {
            assert.equal(interpreter.eq(lhs, rhs), test[2]);
        });
    });
});