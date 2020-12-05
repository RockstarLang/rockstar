(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Satriani = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
    Environment: Environment,
    eq: eq
}

const MYSTERIOUS = '__MYSTERIOUS__';

function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
    this.output = (parent && parent.output ? parent.output : console.log);
    // Because nodeJS is based on asynchronous IO, there is no built-in console.readline or similar
    // so by default, any input will yield an empty string.
    this.input = (parent && parent.input ? parent.input : () => "")
}

Environment.prototype = {
    extend: function () { return new Environment(this) },

    exists: function (name) {
        return (name in this.vars);
    },

    lookup: function (name, index, force_array) {
        if (name in this.vars) {
            let variable = this.vars[name];
            if (Array.isArray(variable)) {
                if (typeof (index) == 'undefined' || index == null) {
                    if (force_array || this.FORCE_ARRAY_FLAG) {
                        this.FORCE_ARRAY_FLAG = false;
                        return variable;
                    }
                    return (variable.length);
                }
                return variable[index];
            }
            if (typeof (variable) == 'string' && typeof (index) == 'number') return (variable[index]);
            return variable;
        }
        throw new Error("Undefined variable " + name);
    },

    assign: function (name, value, index, local) {
        let container = (!local && typeof (value) != "function" && this.parent && name in this.parent.vars) ? this.parent.vars : this.vars;
        if (typeof (index) == 'undefined' || index == null) return container[name] = value;
        if (name in container) {
            if (!Array.isArray(container[name])) throw new Error(`Can't assign ${name} at ${index} - ${name} is not an indexed variable.`);
        } else {
            container[name] = new Array();
        }
        return container[name][index] = value;
    },

    run: function (program) {
        let result = evaluate(program, this);
        return (result ? result.value : undefined);
    },

    dealias: function (expr) {
        if (expr.variable.pronoun) return this.pronoun_alias;
        return (expr.variable);
    },

    pronoun_alias: null,
}

function evaluate(tree, env) {
    if (tree == MYSTERIOUS || typeof (tree) == 'undefined') return undefined;
    if (tree == null) return null;
    let list = Object.entries(tree)
    for (let i = 0; i < list.length; i++) {
        let node = list[i];
        let type = node[0];
        let expr = node[1];
        switch (type) {
            case "action": return (tree);
            case "list":
                let result = null;
                for (let i = 0; i < expr.length; i++) {
                    let next = expr[i];
                    result = evaluate(next, env);
                    if (result && result.action) return (result);
                }
                return result;
            case "conditional":
                if (evaluate(expr.condition, env)) {
                    return evaluate(expr.consequent, env);
                } else if (expr.alternate) {
                    return evaluate(expr.alternate, env);
                }
                return;
            case 'break':
                return { 'action': 'break' };
            case 'continue':
                return { 'action': 'continue' };
            case "return":
                return { 'action': 'return', 'value': evaluate(expr.expression, env) };
            case "number":
            case "string":
            case "constant":
                return (expr);
            case "output":
                let printable = evaluate(expr, env); 2
                if (typeof (printable) == 'undefined') printable = "mysterious";
                env.output(printable);
                return;
            case "listen":
                return env.input();
            case "binary":
                return binary(expr, env);
            case "lookup":
                return lookup(expr, env);
            case "assign":
                return assign(expr, env);
            case "pronoun":
                return env.lookup(env.pronoun_alias);
            case "blank":
                return;
            case "rounding":
                return rounding(expr, env);
            case "mutation":
                return mutation(expr, env);
            case "increment":
                let increment_name = env.dealias(expr);
                let old_increment_value = env.lookup(increment_name);
                switch (typeof (old_increment_value)) {
                    case "boolean":
                        if (expr.multiple % 2 != 0) env.assign(increment_name, !old_increment_value);
                        return;
                    default:
                        env.assign(increment_name, (old_increment_value + expr.multiple));
                        return;
                }
            case "decrement":
                let decrement_name = env.dealias(expr);
                let old_decrement_value = env.lookup(decrement_name);
                switch (typeof (old_decrement_value)) {
                    case "boolean":
                        if (expr.multiple % 2 != 0) env.assign(decrement_name, !old_decrement_value);
                        return;
                    default:
                        env.assign(decrement_name, (old_decrement_value - expr.multiple));
                        return;
                }
            case "while_loop":
                while_outer: while (evaluate(expr.condition, env)) {
                    let result = evaluate(expr.consequent, env);
                    if (result) switch (result.action) {
                        case 'continue':
                            continue while_outer;
                        case 'break':
                            break while_outer;
                        case 'return':
                            return (result);
                    }
                }
                return;
            case "until_loop":
                until_outer: while (!evaluate(expr.condition, env)) {
                    let result = evaluate(expr.consequent, env);
                    if (result) switch (result.action) {
                        case 'continue':
                            continue until_outer;
                        case 'break':
                            break until_outer;
                        case 'return':
                            return (result);
                    }
                }
                return;
            case "comparison":
                let lhs = evaluate(expr.lhs, env);
                let rhs = evaluate(expr.rhs, env);
                switch (expr.comparator) {
                    case "eq":
                        return eq(lhs, rhs);
                    case "ne":
                        return !eq(lhs, rhs);
                    case "lt":
                        return (lhs < rhs);
                    case "le":
                        return (lhs <= rhs);
                    case "ge":
                        return (lhs >= rhs);
                    case "gt":
                        return (lhs > rhs);
                    default:
                        throw new Error(`Unknown comparison operator ${expr.comparator}`);
                }
            case "not":
                return (!evaluate(expr.expression, env));
            case "function":
                env.assign(expr.name, make_lambda(expr, env));
                return;
            case "call":
                let func = env.lookup(expr.name);
                let func_result = func.apply(null, expr.args.map(arg => {
                    env.FORCE_ARRAY_FLAG = true;
                    let value =  evaluate(arg, env);
                    // If the arg is an array, we shallow-copy it when passing it to a function call
                    return (value && value.map ? value.map(e => e) : value);                
                }));
                return (func_result ? func_result.value : undefined);
            case "enlist":
                return enlist(expr, env);
            case "delist":
                return delist(expr, env);
            default:
                if (Array.isArray(tree) && tree.length == 1) return (evaluate(tree[0], env));
                throw new Error("Sorry - I don't know how to evaluate this: " + JSON.stringify(tree))
        }
    }
}

function mutation(expr, env) {
    let source = evaluate(expr.source, env);
    let modifier = evaluate(expr.modifier, env);
    switch (expr.type) {
        case "split":
            return source.toString().split(modifier || "");
        case "cast":
            if (typeof (source) == 'string') return parseInt(source, modifier);
            if (typeof (source) == 'number') return String.fromCharCode(source);
            throw new Error(`I don't know how to cast ${source}`);
        case "join":
            // This is a nasty hack but it avoids having to extend the entire
            // parser with a special additional parameter.
            env.FORCE_ARRAY_FLAG = true;
            source = evaluate(expr.source, env);
            if (Array.isArray(source)) {
                let joiner = (typeof (modifier) == 'undefined' || modifier == null) ? '' : modifier;
                return source.join(joiner);
            }
            throw new Error("I don't know how to join that.");
    }
}

function lookup(expr, env) {
    let lookup_name = env.dealias(expr);
    let index = evaluate(expr.index, env);
    return env.lookup(lookup_name, index);
}

function assign(expr, env) {
    let target = expr.target;
    let index = evaluate(target.index, env);
    let alias = (target.variable.pronoun ? env.pronoun_alias : target.variable);
    let value = evaluate(expr.expression, env);
    env.assign(alias, value, index);
    if (!target.variable.pronoun) env.pronoun_alias = alias;
    return value;
}

function enlist(expr, env) {

    let array_value;
    let array_name = env.dealias(expr);

    if (env.exists(array_name)) {
        array_value = env.lookup(array_name, null, true);
        if (!Array.isArray(array_value)) array_value = [array_value];
    } else {
        array_value = [];
    }
    if (expr.expression) {
        let elements_to_enlist = (expr.expression.map ? expr.expression : [expr.expression]);
        array_value = array_value.concat(elements_to_enlist.map(e => evaluate(e, env)));
    }
    env.assign(array_name, array_value);
    return array_value;

    // let alias = "";
    // let target = expr.target;
    // let index = evaluate(target.index, env);
    // if (target.variable.pronoun) {
    //     alias = env.pronoun_alias;
    // } else {
    //     alias = target.variable;
    //     env.pronoun_alias = alias;
    // }

    // let value;
    // if (env.exists(alias)) {
    //     value = env.lookup(alias);
    //     if (!Array.isArray(value)) value = [value];
    // } else {
    //     value = [];
    // }
    // if (expr.expression) {
    //     let values = (expr.expression.map ? expr.expression : [expr.expression]);
    //     value = value.concat(values.map(e => evaluate(e, env)));
    // }
    // env.assign(alias, value, index);
    // return value;
}

function delist(expr, env) {
    let name = env.dealias(expr);
    let source = env.lookup(name, null, "FIST")
    let result = (source.shift && source.shift());
    return result;
}

function rounding(expr, env) {
    let variable_name = env.dealias(expr);
    let variable_value = env.lookup(variable_name);
    switch (expr.direction) {
        case "up":
            return env.assign(variable_name, Math.ceil(variable_value));
        case "down":
            return env.assign(variable_name, Math.floor(variable_value));
        default:
            return env.assign(variable_name, Math.round(variable_value));
    }
}

function demystify(expr, env) {
    let result = evaluate(expr, env);
    if (typeof (result) == 'undefined') return ('mysterious');
    return (result);
}

function eq(lhs, rhs) {
    if (Array.isArray(lhs)) return (eq_array(lhs, rhs));
    if (Array.isArray(rhs)) return (eq_array(rhs, lhs));

    if (is_nothing(lhs) && is_nothing(rhs)) return (true);
    // if (typeof (lhs) == 'undefined') return (typeof (rhs) == 'undefined');
    // if (typeof (rhs) == 'undefined') return (typeof (lhs) == 'undefined');

    if (typeof (lhs) == 'boolean') return (eq_boolean(lhs, rhs));
    if (typeof (rhs) == 'boolean') return (eq_boolean(rhs, lhs));

    if (typeof (lhs) == 'number') return (eq_number(lhs, rhs));
    if (typeof (rhs) == 'number') return (eq_number(rhs, lhs));

    if (typeof (lhs) == 'string') return (eq_string(lhs, rhs));
    if (typeof (rhs) == 'string') return (eq_string(rhs, lhs));

    return lhs == rhs;
}

function is_nothing(thing) {
    return (
        typeof (thing) == 'undefined'
        ||
        thing === null
        ||
        thing === ""
        ||
        thing == 0
        ||
        thing == false
    );
}

function eq_array(array, other) {
    if (Array.isArray(other)) return ((array.length == other.length) && array.every((el, ix) => el === other[index]));
    if (other == null || other == 0 || other == "") return (array.length == 0);
    return (false);
}

function eq_string(string, other) {
    if (other == null || typeof (other) == 'undefined') return (string === "");
    return (other == string);
}

function eq_number(number, other) {
    if (other == null || typeof (other) == 'undefined') return (number === 0);
    return (other == number);
}

function eq_boolean(bool, other) {
    // false equals null in Rockstar
    if (other == null) other = false;
    // false equals zero in Rockstar
    if (typeof (other) == 'number') other = (other !== 0);
    if (typeof (other) == 'string') other = (other !== "");
    return (bool == other);
}

function make_lambda(expr, env) {
    function lambda() {
        let names = expr.args;
        if (names.length != arguments.length) throw ('Wrong number of arguments supplied to function ' + expr.name + ' (' + expr.args + ')');
        let scope = env.extend();
        for (let i = 0; i < names.length; ++i) scope.assign(names[i], arguments[i], null, 1)
        return evaluate(expr.body, scope);
    }

    return lambda;
}

function binary(b, env) {
    switch (b.op) {
        case "and": return (evaluate(b.lhs, env) && evaluate(b.rhs, env));
        case "nor": return (!evaluate(b.lhs, env) && !evaluate(b.rhs, env));
        case "or": return (evaluate(b.lhs, env) || evaluate(b.rhs, env));
        case '+': return add(b.lhs, b.rhs, env);
        case '-': return subtract(b.lhs, b.rhs, env);
        case '/': return divide(b.lhs, b.rhs, env);
        case '*': return multiply(b.lhs, b.rhs, env);
    }
}

function add(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs]).reduce((acc, val) => acc += demystify(val, env), demystify(lhs, env));
}

function subtract(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs]).reduce((acc, val) => acc -= evaluate(val, env), evaluate(lhs, env));
}

function divide(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs]).reduce((acc, val) => acc /= evaluate(val, env), evaluate(lhs, env));
}

function multiply(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs])
        .map(expr => evaluate(expr, env))
        .reduce(multiply_reduce, evaluate(lhs, env));
}

function multiply_reduce(acc, val, idx, src) {
    // Null, nothing, noone, nowhere, etc. are all zero for multiplication purposes.
    if (acc == null) acc = 0;
    if (val == null) val = 0;
    // Mu ltiplying numbers just works.
    if (typeof (acc) == 'number' && typeof (val) == 'number') return (acc * val);
    // Multiplying strings by numbers does repeated concatenation
    if (typeof (acc) == 'string' && typeof (val) == 'number') return multiply_string(acc, val);
    if (typeof (acc) == 'number' && typeof (val) == 'string') return multiply_string(val, acc);
}

function multiply_string(s, n) {
    let result = Array();
    while (--n >= 0) result.push(s);
    return (result.join(''));
}

},{}],2:[function(require,module,exports){
const parser = require('./satriani.parser.js');
const interpreter = require('./satriani.interpreter.js');

module.exports = {
    Interpreter : function() {
        this.run = function(program, input, output) {
            if (typeof(program) == 'string') program = this.parse(program);
            let env = new interpreter.Environment();
            env.output = output || console.log;
            env.input = input || (() => "");
            return env.run(program);
        }

        this.parse = function(program) {
            return parser.parse(program);
        }
    }
};

},{"./satriani.interpreter.js":1,"./satriani.parser.js":3}],3:[function(require,module,exports){
/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */

"use strict";

function peg$subclass(child, parent) {
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.location = location;
  this.name     = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { program: peg$parseprogram },
      peg$startRuleFunction  = peg$parseprogram,

      peg$c0 = function(p) { return { list: p.filter(item => item) } },
      peg$c1 = function(s) { return s },
      peg$c2 = function() { return null },
      peg$c3 = /^[ \t]/,
      peg$c4 = peg$classExpectation([" ", "\t"], false, false),
      peg$c5 = "(",
      peg$c6 = peg$literalExpectation("(", false),
      peg$c7 = /^[^)]/,
      peg$c8 = peg$classExpectation([")"], true, false),
      peg$c9 = ")",
      peg$c10 = peg$literalExpectation(")", false),
      peg$c11 = /^[;,?!&.]/,
      peg$c12 = peg$classExpectation([";", ",", "?", "!", "&", "."], false, false),
      peg$c13 = "\r",
      peg$c14 = peg$literalExpectation("\r", false),
      peg$c15 = "\n",
      peg$c16 = peg$literalExpectation("\n", false),
      peg$c17 = peg$anyExpectation(),
      peg$c18 = /^[^\n]/,
      peg$c19 = peg$classExpectation(["\n"], true, false),
      peg$c20 = "break",
      peg$c21 = peg$literalExpectation("break", true),
      peg$c22 = function() {
      	return { 'break' : {} }
      },
      peg$c23 = "continue",
      peg$c24 = peg$literalExpectation("continue", true),
      peg$c25 = "take it to the top",
      peg$c26 = peg$literalExpectation("take it to the top", true),
      peg$c27 = function() {
      	return { 'continue' : {} }
      },
      peg$c28 = "takes",
      peg$c29 = peg$literalExpectation("takes", true),
      peg$c30 = function(name, args, body) { return { 'function': {
          	name: name,
              args: args.map(arg => arg),
              body: body
          } } },
      peg$c31 = ", and",
      peg$c32 = peg$literalExpectation(", and", false),
      peg$c33 = "&",
      peg$c34 = peg$literalExpectation("&", false),
      peg$c35 = ",",
      peg$c36 = peg$literalExpectation(",", false),
      peg$c37 = "'n'",
      peg$c38 = peg$literalExpectation("'n'", false),
      peg$c39 = "and",
      peg$c40 = peg$literalExpectation("and", false),
      peg$c41 = function(head, tail) { return [head].concat(tail) },
      peg$c42 = function(arg) { return [arg] },
      peg$c43 = "taking",
      peg$c44 = peg$literalExpectation("taking", true),
      peg$c45 = function(name, args) { return { 'call': { name: name, args: Array.isArray(args) ? args : [args] } } },
      peg$c46 = "return",
      peg$c47 = peg$literalExpectation("return", true),
      peg$c48 = "give back",
      peg$c49 = peg$literalExpectation("give back", true),
      peg$c50 = function(e) { return { 'return': { 'expression' : e } } },
      peg$c51 = "listen to",
      peg$c52 = peg$literalExpectation("listen to", true),
      peg$c53 = function(target) { return { assign: { expression: { listen : ''}, target: target } } },
      peg$c54 = "listen",
      peg$c55 = peg$literalExpectation("listen", true),
      peg$c56 = function() { return { 'listen' : ''} },
      peg$c57 = function(head, tail) {
                return { list : [head].concat(tail) }
              },
      peg$c58 = "else",
      peg$c59 = peg$literalExpectation("else", true),
      peg$c60 = function(a) { return a },
      peg$c61 = "if",
      peg$c62 = peg$literalExpectation("if", true),
      peg$c63 = function(e, c, a) {
                return {
                    'conditional': {
                        'condition' : e,
                          'consequent' : c,
                          'alternate' : a
                      }
                  };
              },
      peg$c64 = "while",
      peg$c65 = peg$literalExpectation("while", true),
      peg$c66 = function(e, c) { return { 'while_loop': {
                  'condition': e,
                  'consequent': c
               } }; },
      peg$c67 = "until",
      peg$c68 = peg$literalExpectation("until", true),
      peg$c69 = function(e, c) { return { 'until_loop': {
                  'condition': e,
                  'consequent': c
               } }; },
      peg$c70 = "say",
      peg$c71 = peg$literalExpectation("say", true),
      peg$c72 = "shout",
      peg$c73 = peg$literalExpectation("shout", true),
      peg$c74 = "whisper",
      peg$c75 = peg$literalExpectation("whisper", true),
      peg$c76 = "scream",
      peg$c77 = peg$literalExpectation("scream", true),
      peg$c78 = function(e) {return {'output': e}},
      peg$c79 = "true",
      peg$c80 = peg$literalExpectation("true", true),
      peg$c81 = "ok",
      peg$c82 = peg$literalExpectation("ok", true),
      peg$c83 = "right",
      peg$c84 = peg$literalExpectation("right", true),
      peg$c85 = "yes",
      peg$c86 = peg$literalExpectation("yes", true),
      peg$c87 = function() { return { constant: true } },
      peg$c88 = "false",
      peg$c89 = peg$literalExpectation("false", true),
      peg$c90 = "lies",
      peg$c91 = peg$literalExpectation("lies", true),
      peg$c92 = "wrong",
      peg$c93 = peg$literalExpectation("wrong", true),
      peg$c94 = "no",
      peg$c95 = peg$literalExpectation("no", true),
      peg$c96 = function() { return { constant: false } },
      peg$c97 = "null",
      peg$c98 = peg$literalExpectation("null", true),
      peg$c99 = "nothing",
      peg$c100 = peg$literalExpectation("nothing", true),
      peg$c101 = "nowhere",
      peg$c102 = peg$literalExpectation("nowhere", true),
      peg$c103 = "nobody",
      peg$c104 = peg$literalExpectation("nobody", true),
      peg$c105 = "gone",
      peg$c106 = peg$literalExpectation("gone", true),
      peg$c107 = function() { return { constant: null } },
      peg$c108 = "empty",
      peg$c109 = peg$literalExpectation("empty", true),
      peg$c110 = "silent",
      peg$c111 = peg$literalExpectation("silent", true),
      peg$c112 = "silence",
      peg$c113 = peg$literalExpectation("silence", true),
      peg$c114 = function() { return { constant: "" } },
      peg$c115 = "mysterious",
      peg$c116 = peg$literalExpectation("mysterious", false),
      peg$c117 = function() { return '__MYSTERIOUS__' },
      peg$c118 = "-",
      peg$c119 = peg$literalExpectation("-", false),
      peg$c120 = /^[0-9]/,
      peg$c121 = peg$classExpectation([["0", "9"]], false, false),
      peg$c122 = ".",
      peg$c123 = peg$literalExpectation(".", false),
      peg$c124 = function(n) { return {number: parseFloat(n)} },
      peg$c125 = function(n) { return {number: parseFloat(n) } },
      peg$c126 = "\"",
      peg$c127 = peg$literalExpectation("\"", false),
      peg$c128 = /^[^"]/,
      peg$c129 = peg$classExpectation(["\""], true, false),
      peg$c130 = function(s) { return {string: s}},
      peg$c131 = "nor",
      peg$c132 = peg$literalExpectation("nor", false),
      peg$c133 = function(lhs, rhs) {
      	return { 'binary' : { op: 'nor', lhs: lhs, rhs: rhs } } },
      peg$c134 = "or",
      peg$c135 = peg$literalExpectation("or", false),
      peg$c136 = function(lhs, rhs) {
      	return { 'binary': {
              op: 'or',
              lhs: lhs,
              rhs: rhs
          } }
       },
      peg$c137 = function(lhs, rhs) {
      	return { 'binary': {
              op: 'and',
              lhs: lhs,
              rhs: rhs
          } }
       },
      peg$c138 = "aint",
      peg$c139 = peg$literalExpectation("aint", true),
      peg$c140 = "ain't",
      peg$c141 = peg$literalExpectation("ain't", true),
      peg$c142 = function() { return 'ne' },
      peg$c143 = "is",
      peg$c144 = peg$literalExpectation("is", true),
      peg$c145 = function() { return 'eq' },
      peg$c146 = function(lhs, c, rhs) {
            return {
                comparison: {
                    comparator: c,
                      lhs: lhs,
                      rhs: rhs
                  }
              };
          },
      peg$c147 = "not",
      peg$c148 = peg$literalExpectation("not", false),
      peg$c149 = function(e) { return { 'not': { expression: e} } },
      peg$c150 = "higher",
      peg$c151 = peg$literalExpectation("higher", true),
      peg$c152 = "greater",
      peg$c153 = peg$literalExpectation("greater", true),
      peg$c154 = "bigger",
      peg$c155 = peg$literalExpectation("bigger", true),
      peg$c156 = "stronger",
      peg$c157 = peg$literalExpectation("stronger", true),
      peg$c158 = "lower",
      peg$c159 = peg$literalExpectation("lower", true),
      peg$c160 = "less",
      peg$c161 = peg$literalExpectation("less", true),
      peg$c162 = "smaller",
      peg$c163 = peg$literalExpectation("smaller", true),
      peg$c164 = "weaker",
      peg$c165 = peg$literalExpectation("weaker", true),
      peg$c166 = "high",
      peg$c167 = peg$literalExpectation("high", true),
      peg$c168 = "great",
      peg$c169 = peg$literalExpectation("great", true),
      peg$c170 = "big",
      peg$c171 = peg$literalExpectation("big", true),
      peg$c172 = "strong",
      peg$c173 = peg$literalExpectation("strong", true),
      peg$c174 = "low",
      peg$c175 = peg$literalExpectation("low", true),
      peg$c176 = "small",
      peg$c177 = peg$literalExpectation("small", true),
      peg$c178 = "weak",
      peg$c179 = peg$literalExpectation("weak", true),
      peg$c180 = "than",
      peg$c181 = peg$literalExpectation("than", true),
      peg$c182 = function() { return 'gt' },
      peg$c183 = function() { return 'lt' },
      peg$c184 = "as",
      peg$c185 = peg$literalExpectation("as", true),
      peg$c186 = function() { return 'ge' },
      peg$c187 = function() { return 'le' },
      peg$c188 = function(first, rest) { return rest.reduce(function(memo, curr) {
                            return { binary: { op: curr[0], lhs: memo, rhs: curr[1]} };
                      }, first); },
      peg$c189 = function(first, rest) { return rest.reduce(function(memo, curr) {
                          return { binary: { op: curr[0], lhs: memo, rhs: curr[1]} };
                      }, first); },
      peg$c190 = "+",
      peg$c191 = peg$literalExpectation("+", false),
      peg$c192 = "plus ",
      peg$c193 = peg$literalExpectation("plus ", false),
      peg$c194 = "with ",
      peg$c195 = peg$literalExpectation("with ", false),
      peg$c196 = function() { return '+' },
      peg$c197 = "minus ",
      peg$c198 = peg$literalExpectation("minus ", false),
      peg$c199 = "without ",
      peg$c200 = peg$literalExpectation("without ", false),
      peg$c201 = function() { return '-' },
      peg$c202 = "*",
      peg$c203 = peg$literalExpectation("*", false),
      peg$c204 = "times ",
      peg$c205 = peg$literalExpectation("times ", false),
      peg$c206 = "of ",
      peg$c207 = peg$literalExpectation("of ", false),
      peg$c208 = function() { return '*' },
      peg$c209 = "/",
      peg$c210 = peg$literalExpectation("/", false),
      peg$c211 = "over ",
      peg$c212 = peg$literalExpectation("over ", false),
      peg$c213 = "between ",
      peg$c214 = peg$literalExpectation("between ", false),
      peg$c215 = function() { return '/' },
      peg$c216 = "they",
      peg$c217 = peg$literalExpectation("they", true),
      peg$c218 = "them",
      peg$c219 = peg$literalExpectation("them", true),
      peg$c220 = "she",
      peg$c221 = peg$literalExpectation("she", true),
      peg$c222 = "him",
      peg$c223 = peg$literalExpectation("him", true),
      peg$c224 = "her",
      peg$c225 = peg$literalExpectation("her", true),
      peg$c226 = "hir",
      peg$c227 = peg$literalExpectation("hir", true),
      peg$c228 = "zie",
      peg$c229 = peg$literalExpectation("zie", true),
      peg$c230 = "zir",
      peg$c231 = peg$literalExpectation("zir", true),
      peg$c232 = "xem",
      peg$c233 = peg$literalExpectation("xem", true),
      peg$c234 = "ver",
      peg$c235 = peg$literalExpectation("ver", true),
      peg$c236 = "ze",
      peg$c237 = peg$literalExpectation("ze", true),
      peg$c238 = "ve",
      peg$c239 = peg$literalExpectation("ve", true),
      peg$c240 = "xe",
      peg$c241 = peg$literalExpectation("xe", true),
      peg$c242 = "it",
      peg$c243 = peg$literalExpectation("it", true),
      peg$c244 = "he",
      peg$c245 = peg$literalExpectation("he", true),
      peg$c246 = function(pronoun) { return { pronoun: pronoun.toLowerCase() } },
      peg$c247 = "pop",
      peg$c248 = peg$literalExpectation("pop", true),
      peg$c249 = "roll",
      peg$c250 = peg$literalExpectation("roll", true),
      peg$c251 = function(v) { return { delist: { variable: v } }; },
      peg$c252 = function(d) { return d; },
      peg$c253 = "at",
      peg$c254 = peg$literalExpectation("at", true),
      peg$c255 = function(v, i) { return { lookup: { variable: v, index: i } }; },
      peg$c256 = function(v) { return { lookup: { variable: v } }; },
      peg$c257 = "an",
      peg$c258 = peg$literalExpectation("an", true),
      peg$c259 = "a",
      peg$c260 = peg$literalExpectation("a", true),
      peg$c261 = "the",
      peg$c262 = peg$literalExpectation("the", true),
      peg$c263 = "my",
      peg$c264 = peg$literalExpectation("my", true),
      peg$c265 = "your",
      peg$c266 = peg$literalExpectation("your", true),
      peg$c267 = /^[A-Z\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD8\xD9\xDA\xDB\xDC\xDD\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0138\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D]/,
      peg$c268 = peg$classExpectation([["A", "Z"], "\xC0", "\xC1", "\xC2", "\xC3", "\xC4", "\xC5", "\xC6", "\xC7", "\xC8", "\xC9", "\xCA", "\xCB", "\xCC", "\xCD", "\xCE", "\xCF", "\xD0", "\xD1", "\xD2", "\xD3", "\xD4", "\xD5", "\xD6", "\xD8", "\xD9", "\xDA", "\xDB", "\xDC", "\xDD", "\xDE", "\u0100", "\u0102", "\u0104", "\u0106", "\u0108", "\u010A", "\u010C", "\u010E", "\u0110", "\u0112", "\u0114", "\u0116", "\u0118", "\u011A", "\u011C", "\u011E", "\u0120", "\u0122", "\u0124", "\u0126", "\u0128", "\u012A", "\u012C", "\u012E", "\u0130", "\u0132", "\u0134", "\u0136", "\u0138", "\u0139", "\u013B", "\u013D", "\u013F", "\u0141", "\u0143", "\u0145", "\u0147", "\u014A", "\u014C", "\u014E", "\u0150", "\u0152", "\u0154", "\u0156", "\u0158", "\u015A", "\u015C", "\u015E", "\u0160", "\u0162", "\u0164", "\u0166", "\u0168", "\u016A", "\u016C", "\u016E", "\u0170", "\u0172", "\u0174", "\u0176", "\u0178", "\u0179", "\u017B", "\u017D"], false, false),
      peg$c269 = /^[a-z\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF8\xF9\xFA\xFB\xFC\xFD\xFE\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\xFF\u017A\u017C\u017E\u0149\xDF]/,
      peg$c270 = peg$classExpectation([["a", "z"], "\xE0", "\xE1", "\xE2", "\xE3", "\xE4", "\xE5", "\xE6", "\xE7", "\xE8", "\xE9", "\xEA", "\xEB", "\xEC", "\xED", "\xEE", "\xEF", "\xF0", "\xF1", "\xF2", "\xF3", "\xF4", "\xF5", "\xF6", "\xF8", "\xF9", "\xFA", "\xFB", "\xFC", "\xFD", "\xFE", "\u0101", "\u0103", "\u0105", "\u0107", "\u0109", "\u010B", "\u010D", "\u010F", "\u0111", "\u0113", "\u0115", "\u0117", "\u0119", "\u011B", "\u011D", "\u011F", "\u0121", "\u0123", "\u0125", "\u0127", "\u0129", "\u012B", "\u012D", "\u012F", "\u0131", "\u0133", "\u0135", "\u0137", "\u0138", "\u013A", "\u013C", "\u013E", "\u0140", "\u0142", "\u0144", "\u0146", "\u0148", "\u014B", "\u014D", "\u014F", "\u0151", "\u0153", "\u0155", "\u0157", "\u0159", "\u015B", "\u015D", "\u015F", "\u0161", "\u0163", "\u0165", "\u0167", "\u0169", "\u016B", "\u016D", "\u016F", "\u0171", "\u0173", "\u0175", "\u0177", "\xFF", "\u017A", "\u017C", "\u017E", "\u0149", "\xDF"], false, false),
      peg$c271 = function(prefix, name) { return (prefix + '_' + name).toLowerCase() },
      peg$c272 = "'s",
      peg$c273 = peg$literalExpectation("'s", false),
      peg$c274 = "=",
      peg$c275 = peg$literalExpectation("=", false),
      peg$c276 = "is ",
      peg$c277 = peg$literalExpectation("is ", true),
      peg$c278 = "was ",
      peg$c279 = peg$literalExpectation("was ", true),
      peg$c280 = "are ",
      peg$c281 = peg$literalExpectation("are ", true),
      peg$c282 = "were ",
      peg$c283 = peg$literalExpectation("were ", true),
      peg$c284 = "rock",
      peg$c285 = peg$literalExpectation("rock", true),
      peg$c286 = "push",
      peg$c287 = peg$literalExpectation("push", true),
      peg$c288 = "into",
      peg$c289 = peg$literalExpectation("into", true),
      peg$c290 = function(i) { return i },
      peg$c291 = function(v, i) { return { variable: v, index: i }; },
      peg$c292 = function(target, e) { return { assign: { target: target, expression: e} }; },
      peg$c293 = "says ",
      peg$c294 = peg$literalExpectation("says ", true),
      peg$c295 = "put",
      peg$c296 = peg$literalExpectation("put", true),
      peg$c297 = function(e, target) { return { assign: { target: target, expression: e} }; },
      peg$c298 = "let",
      peg$c299 = peg$literalExpectation("let", true),
      peg$c300 = "be",
      peg$c301 = peg$literalExpectation("be", true),
      peg$c302 = function(target, o, e) {
            return { assign: {
              target: target,
              expression: { binary: {  op: o, lhs: { lookup: target }, rhs: e } }
            } };
          },
      peg$c303 = function(t, e) { return { assign: { target: t, expression: e} }; },
      peg$c304 = function(e, v) { return { enlist: { variable: v, expression: e } }; },
      peg$c305 = "like",
      peg$c306 = peg$literalExpectation("like", true),
      peg$c307 = function(v, e) { return { enlist: { variable: v, expression: e } }; },
      peg$c308 = "with",
      peg$c309 = peg$literalExpectation("with", true),
      peg$c310 = function(v) { return { enlist: { variable: v } }; },
      peg$c311 = function(e, target) { return { assign: { target: target, expression: e } }; },
      peg$c312 = function(s) { return { string: s} },
      peg$c313 = function(n, d) { return { number: parseFloat(d?n+'.'+d:n)}},
      peg$c314 = function(d) {return d},
      peg$c315 = /^[0-9',;:?!+_\/]/,
      peg$c316 = peg$classExpectation([["0", "9"], "'", ",", ";", ":", "?", "!", "+", "_", "/"], false, false),
      peg$c317 = function(head, tail) { return head + tail },
      peg$c318 = function(d) { return d },
      peg$c319 = /^[A-Za-z\-']/,
      peg$c320 = peg$classExpectation([["A", "Z"], ["a", "z"], "-", "'"], false, false),
      peg$c321 = function(t) { return (t.filter(c => /[A-Za-z\-]/.test(c)).length%10).toString()},
      peg$c322 = function(name) { return isKeyword(name) },
      peg$c323 = function(name) { return name },
      peg$c324 = function(noun) { return isKeyword(noun) },
      peg$c325 = function(noun) { return noun },
      peg$c326 = " ",
      peg$c327 = peg$literalExpectation(" ", false),
      peg$c328 = function(head) { return head.replace(/ /g, '_').toLowerCase()  },
      peg$c329 = "build",
      peg$c330 = peg$literalExpectation("build", true),
      peg$c331 = "up",
      peg$c332 = peg$literalExpectation("up", true),
      peg$c333 = function(v, t) { return {
            increment: {
                variable: v,
                  multiple: t.length
              }
          }; },
      peg$c334 = "knock",
      peg$c335 = peg$literalExpectation("knock", true),
      peg$c336 = "down",
      peg$c337 = peg$literalExpectation("down", true),
      peg$c338 = function(v, t) { return {
            decrement: {
                variable: v,
                  multiple: t.length
              }
          }; },
      peg$c339 = "cut",
      peg$c340 = peg$literalExpectation("cut", true),
      peg$c341 = "split",
      peg$c342 = peg$literalExpectation("split", true),
      peg$c343 = "shatter",
      peg$c344 = peg$literalExpectation("shatter", true),
      peg$c345 = function() { return 'split' },
      peg$c346 = "cast",
      peg$c347 = peg$literalExpectation("cast", true),
      peg$c348 = "burn",
      peg$c349 = peg$literalExpectation("burn", true),
      peg$c350 = function() { return 'cast' },
      peg$c351 = "join",
      peg$c352 = peg$literalExpectation("join", true),
      peg$c353 = "unite",
      peg$c354 = peg$literalExpectation("unite", true),
      peg$c355 = function() { return 'join' },
      peg$c356 = "using",
      peg$c357 = peg$literalExpectation("using", true),
      peg$c358 = function(m) { return m },
      peg$c359 = function(op, s, t, m) { return { assign: { target: t, expression: { mutation: { type: op, source: s, modifier: m } } } } ; },
      peg$c360 = function(op, s, m) { return { assign: { target: s, expression: { mutation: { type: op, source: { lookup: s }, modifier: m } } } } ; },
      peg$c361 = "turn",
      peg$c362 = peg$literalExpectation("turn", true),
      peg$c363 = function(v) { return { rounding: { variable: v, direction: 'down'  } }; },
      peg$c364 = function(v) { return { rounding: { variable: v, direction: 'up'  } }; },
      peg$c365 = function(v) { return { rounding: { variable: v, direction: 'up' } }; },
      peg$c366 = "round",
      peg$c367 = peg$literalExpectation("round", true),
      peg$c368 = "around",
      peg$c369 = peg$literalExpectation("around", true),
      peg$c370 = function(v) { return { rounding: { variable: v, direction: 'nearest' } }; },

      peg$currPos          = 0,
      peg$savedPos         = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
      peg$maxFailPos       = 0,
      peg$maxFailExpected  = [],
      peg$silentFails      = 0,

      peg$resultsCache = {},

      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line:   details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails   = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line:   startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line:   endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseprogram() {
    var s0, s1, s2;

    var key    = peg$currPos * 100 + 0,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseline();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseline();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c0(s1);
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseline() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 1,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parse_();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parse_();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsestatement();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parseEOL();
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseEOL();
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$parseEOF();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c1(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseEOL();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c2();
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsewhitespace() {
    var s0;

    var key    = peg$currPos * 100 + 2,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (peg$c3.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c4); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecomment() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 3,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c5;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c6); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$c7.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        if (peg$c7.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c8); }
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 41) {
          s3 = peg$c9;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c10); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parse_() {
    var s0, s1;

    var key    = peg$currPos * 100 + 4,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = [];
    s1 = peg$parsewhitespace();
    if (s1 === peg$FAILED) {
      s1 = peg$parsecomment();
    }
    if (s1 !== peg$FAILED) {
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsewhitespace();
        if (s1 === peg$FAILED) {
          s1 = peg$parsecomment();
        }
      }
    } else {
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenoise() {
    var s0;

    var key    = peg$currPos * 100 + 5,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parse_();
    if (s0 === peg$FAILED) {
      if (peg$c11.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c12); }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseEOL() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 6,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsenoise();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsenoise();
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 13) {
        s2 = peg$c13;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c14); }
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s3 = peg$c15;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c16); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseEOF() {
    var s0, s1;

    var key    = peg$currPos * 100 + 7,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    peg$silentFails++;
    if (input.length > peg$currPos) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c17); }
    }
    peg$silentFails--;
    if (s1 === peg$FAILED) {
      s0 = void 0;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseignore_rest_of_line() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 8,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$c18.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        if (peg$c18.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = null;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsestatement() {
    var s0, s1, s2;

    var key    = peg$currPos * 100 + 9,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parse_();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parse_();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsebreak();
      if (s2 === peg$FAILED) {
        s2 = peg$parsecontinue();
        if (s2 === peg$FAILED) {
          s2 = peg$parsefunction();
          if (s2 === peg$FAILED) {
            s2 = peg$parsefunction_call();
            if (s2 === peg$FAILED) {
              s2 = peg$parsefunction_return();
              if (s2 === peg$FAILED) {
                s2 = peg$parseloop();
                if (s2 === peg$FAILED) {
                  s2 = peg$parseconditional();
                  if (s2 === peg$FAILED) {
                    s2 = peg$parseoperation();
                    if (s2 === peg$FAILED) {
                      s2 = peg$parsenor();
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsebreak() {
    var s0, s1, s2;

    var key    = peg$currPos * 100 + 10,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c20) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c21); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseignore_rest_of_line();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c22();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecontinue() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 11,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c23) {
      s2 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c24); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parseignore_rest_of_line();
      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 18).toLowerCase() === peg$c25) {
        s1 = input.substr(peg$currPos, 18);
        peg$currPos += 18;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c27();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsefunction() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    var key    = peg$currPos * 100 + 12,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsevariable();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c28) {
          s3 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c29); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsevariable_list();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseEOL();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseblock();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseEOL();
                  if (s8 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c30(s1, s5, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseexpression_list_separator() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 13,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 5) === peg$c31) {
        s2 = peg$c31;
        peg$currPos += 5;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 38) {
          s2 = peg$c33;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c34); }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s2 = peg$c35;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c36); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c37) {
              s2 = peg$c37;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c38); }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsevariable_list_separator() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 14,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parseexpression_list_separator();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c39) {
          s2 = peg$c39;
          peg$currPos += 3;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c40); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsevariable_list() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 15,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsevariable();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsevariable_list_separator();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevariable_list();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c41(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsevariable();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c42(s1);
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsefunction_call() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 16,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsevariable();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c43) {
          s3 = input.substr(peg$currPos, 6);
          peg$currPos += 6;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c44); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpression_list();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c45(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseexpression_list() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 17,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsesimple_expression();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseexpression_list_separator();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexpression_list();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c41(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsesimple_expression();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c42(s1);
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsereturn() {
    var s0;

    var key    = peg$currPos * 100 + 18,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c46) {
      s0 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c47); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 9).toLowerCase() === peg$c48) {
        s0 = input.substr(peg$currPos, 9);
        peg$currPos += 9;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsefunction_return() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 19,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsereturn();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenor();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c50(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseoperation() {
    var s0;

    var key    = peg$currPos * 100 + 20,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parsereadline();
    if (s0 === peg$FAILED) {
      s0 = peg$parseoutput();
      if (s0 === peg$FAILED) {
        s0 = peg$parsecrement();
        if (s0 === peg$FAILED) {
          s0 = peg$parsemutation();
          if (s0 === peg$FAILED) {
            s0 = peg$parseassignment();
            if (s0 === peg$FAILED) {
              s0 = peg$parserounding();
            }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsereadline() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 21,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c51) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c52); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseassignable();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c53(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6).toLowerCase() === peg$c54) {
        s1 = input.substr(peg$currPos, 6);
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c56();
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecontinuation() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 22,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseEOL();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parse_();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parse_();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsestatement();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c1(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseblock() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 23,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsestatement();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsecontinuation();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsecontinuation();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c57(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsestatement();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1);
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseconsequent() {
    var s0, s1, s2;

    var key    = peg$currPos * 100 + 24,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsestatement();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseEOL();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseblock();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c1(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsealternate() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 25,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c58) {
        s2 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c59); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsestatement();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c60(s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseEOL();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseEOL();
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c58) {
          s2 = input.substr(peg$currPos, 4);
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c59); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsestatement();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c60(s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseEOL();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseEOL();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 4).toLowerCase() === peg$c58) {
            s2 = input.substr(peg$currPos, 4);
            peg$currPos += 4;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c59); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseEOL();
            if (s3 !== peg$FAILED) {
              s4 = peg$parseblock();
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c60(s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseEOL();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c2();
          }
          s0 = s1;
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseconditional() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 26,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c61) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c62); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenor();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseconsequent();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsealternate();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c63(s3, s4, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseloopable() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 27,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsestatement();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseEOL();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseblock();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseEOL();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c1(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseloop() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 28,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c64) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c65); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenor();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseloopable();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c66(s3, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c67) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c68); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenor();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseloopable();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c69(s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseoutput() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 29,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c70) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c71); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c72) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c73); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c74) {
          s1 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c75); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c76) {
            s1 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c77); }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenor();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c78(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsesimple_expression() {
    var s0;

    var key    = peg$currPos * 100 + 30,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parsefunction_call();
    if (s0 === peg$FAILED) {
      s0 = peg$parseconstant();
      if (s0 === peg$FAILED) {
        s0 = peg$parselookup();
        if (s0 === peg$FAILED) {
          s0 = peg$parseliteral();
          if (s0 === peg$FAILED) {
            s0 = peg$parsepronoun();
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseliteral() {
    var s0;

    var key    = peg$currPos * 100 + 31,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parseconstant();
    if (s0 === peg$FAILED) {
      s0 = peg$parsenumber();
      if (s0 === peg$FAILED) {
        s0 = peg$parsestring();
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseconstant() {
    var s0;

    var key    = peg$currPos * 100 + 32,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parsenull();
    if (s0 === peg$FAILED) {
      s0 = peg$parsetrue();
      if (s0 === peg$FAILED) {
        s0 = peg$parsefalse();
        if (s0 === peg$FAILED) {
          s0 = peg$parseempty_string();
          if (s0 === peg$FAILED) {
            s0 = peg$parsemysterious();
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsetrue() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 33,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c79) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c80); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 2).toLowerCase() === peg$c81) {
        s1 = input.substr(peg$currPos, 2);
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c83) {
          s1 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c84); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c85) {
            s1 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c86); }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseletter();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c87();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsefalse() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 34,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c88) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c89); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c90) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c91); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c92) {
          s1 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c93); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c94) {
            s1 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c95); }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseletter();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c96();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenull() {
    var s0, s1;

    var key    = peg$currPos * 100 + 35,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c97) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c98); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c99) {
        s1 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c100); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c101) {
          s1 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c102); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c103) {
            s1 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c104); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c105) {
              s1 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c106); }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c107();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseempty_string() {
    var s0, s1;

    var key    = peg$currPos * 100 + 36,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c108) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c109); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 6).toLowerCase() === peg$c110) {
        s1 = input.substr(peg$currPos, 6);
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c111); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c112) {
          s1 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c113); }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c114();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsemysterious() {
    var s0, s1;

    var key    = peg$currPos * 100 + 37,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 10) === peg$c115) {
      s1 = peg$c115;
      peg$currPos += 10;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c116); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c117();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenumber() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    var key    = peg$currPos * 100 + 38,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 45) {
      s3 = peg$c118;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c119); }
    }
    if (s3 === peg$FAILED) {
      s3 = null;
    }
    if (s3 !== peg$FAILED) {
      s4 = [];
      if (peg$c120.test(input.charAt(peg$currPos))) {
        s5 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c121); }
      }
      if (s5 !== peg$FAILED) {
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          if (peg$c120.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c121); }
          }
        }
      } else {
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s6 = peg$c122;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c123); }
        }
        if (s6 !== peg$FAILED) {
          s7 = [];
          if (peg$c120.test(input.charAt(peg$currPos))) {
            s8 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c121); }
          }
          if (s8 !== peg$FAILED) {
            while (s8 !== peg$FAILED) {
              s7.push(s8);
              if (peg$c120.test(input.charAt(peg$currPos))) {
                s8 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s8 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c121); }
              }
            }
          } else {
            s7 = peg$FAILED;
          }
          if (s7 !== peg$FAILED) {
            s6 = [s6, s7];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 === peg$FAILED) {
          s5 = null;
        }
        if (s5 !== peg$FAILED) {
          s3 = [s3, s4, s5];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c122;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c123); }
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c124(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s3 = peg$c122;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c123); }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        if (peg$c120.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c121); }
        }
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (peg$c120.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c121); }
            }
          }
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c125(s1);
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsestring() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 39,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 34) {
      s1 = peg$c126;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c127); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = [];
      if (peg$c128.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c129); }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        if (peg$c128.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c129); }
        }
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 34) {
          s3 = peg$c126;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c130(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenor() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 40,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseor();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c131) {
          s3 = peg$c131;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c132); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenor();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c133(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseor();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseor() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 41,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseand();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c134) {
          s3 = peg$c134;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c135); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseor();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c136(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseand();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseand() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 42,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseequality_check();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c39) {
          s3 = peg$c39;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c40); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseand();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c137(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseequality_check();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseeq() {
    var s0, s1;

    var key    = peg$currPos * 100 + 43,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c138) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c139); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c140) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c141); }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c142();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2).toLowerCase() === peg$c143) {
        s1 = input.substr(peg$currPos, 2);
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c144); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c145();
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseequality_check() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 44,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsenot();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseeq();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseequality_check();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c146(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsenot();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsenot() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 45,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c147) {
      s1 = peg$c147;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c148); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenot();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c149(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsecomparison();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecomparison() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 46,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsearithmetic();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecomparator();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecomparison();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c146(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsearithmetic();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsegreater() {
    var s0;

    var key    = peg$currPos * 100 + 47,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c150) {
      s0 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c151); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c152) {
        s0 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c153); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c154) {
          s0 = input.substr(peg$currPos, 6);
          peg$currPos += 6;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c155); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 8).toLowerCase() === peg$c156) {
            s0 = input.substr(peg$currPos, 8);
            peg$currPos += 8;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c157); }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsesmaller() {
    var s0;

    var key    = peg$currPos * 100 + 48,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c158) {
      s0 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c159); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c160) {
        s0 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c161); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c162) {
          s0 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c163); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c164) {
            s0 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c165); }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsegreat() {
    var s0;

    var key    = peg$currPos * 100 + 49,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c166) {
      s0 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c167); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c168) {
        s0 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c169); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c170) {
          s0 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c171); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c172) {
            s0 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c173); }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsesmall() {
    var s0;

    var key    = peg$currPos * 100 + 50,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c174) {
      s0 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c175); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c176) {
        s0 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c177); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c178) {
          s0 = input.substr(peg$currPos, 4);
          peg$currPos += 4;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c179); }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecomparator() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    var key    = peg$currPos * 100 + 51,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c143) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c144); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsegreater();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c180) {
              s5 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c181); }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c182();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2).toLowerCase() === peg$c143) {
        s1 = input.substr(peg$currPos, 2);
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c144); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesmaller();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 4).toLowerCase() === peg$c180) {
                s5 = input.substr(peg$currPos, 4);
                peg$currPos += 4;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c181); }
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c183();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2).toLowerCase() === peg$c143) {
          s1 = input.substr(peg$currPos, 2);
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c144); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2).toLowerCase() === peg$c184) {
              s3 = input.substr(peg$currPos, 2);
              peg$currPos += 2;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c185); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsegreat();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c184) {
                      s7 = input.substr(peg$currPos, 2);
                      peg$currPos += 2;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c185); }
                    }
                    if (s7 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c186();
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c143) {
            s1 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c144); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2).toLowerCase() === peg$c184) {
                s3 = input.substr(peg$currPos, 2);
                peg$currPos += 2;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c185); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsesmall();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 !== peg$FAILED) {
                      if (input.substr(peg$currPos, 2).toLowerCase() === peg$c184) {
                        s7 = input.substr(peg$currPos, 2);
                        peg$currPos += 2;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c185); }
                      }
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c187();
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsearithmetic() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 52,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseproduct();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parseadd();
      if (s4 === peg$FAILED) {
        s4 = peg$parsesubtract();
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseproduct();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parseadd();
          if (s4 === peg$FAILED) {
            s4 = peg$parsesubtract();
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseproduct();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c188(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseproduct();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseproduct() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 53,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsesimple_expression();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsemultiply();
      if (s4 === peg$FAILED) {
        s4 = peg$parsedivide();
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseexpression_list();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsemultiply();
          if (s4 === peg$FAILED) {
            s4 = peg$parsedivide();
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpression_list();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c189(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseexpression_list();
      if (s0 === peg$FAILED) {
        s0 = peg$parsesimple_expression();
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseadd() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 54,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parse_();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parse_();
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 43) {
        s2 = peg$c190;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c191); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c192) {
          s2 = peg$c192;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c193); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 5) === peg$c194) {
            s2 = peg$c194;
            peg$currPos += 5;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c195); }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parse_();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parse_();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c196();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsesubtract() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 55,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parse_();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parse_();
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c118;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 6) === peg$c197) {
          s2 = peg$c197;
          peg$currPos += 6;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c198); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 8) === peg$c199) {
            s2 = peg$c199;
            peg$currPos += 8;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c200); }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parse_();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parse_();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c201();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsemultiply() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 56,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parse_();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parse_();
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 42) {
        s2 = peg$c202;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c203); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 6) === peg$c204) {
          s2 = peg$c204;
          peg$currPos += 6;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c205); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c206) {
            s2 = peg$c206;
            peg$currPos += 3;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c207); }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parse_();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parse_();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c208();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsedivide() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 57,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parse_();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parse_();
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 47) {
        s2 = peg$c209;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c210); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c211) {
          s2 = peg$c211;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c212); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 8) === peg$c213) {
            s2 = peg$c213;
            peg$currPos += 8;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c214); }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parse_();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parse_();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c215();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecompoundable_operator() {
    var s0;

    var key    = peg$currPos * 100 + 58,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parseadd();
    if (s0 === peg$FAILED) {
      s0 = peg$parsesubtract();
      if (s0 === peg$FAILED) {
        s0 = peg$parsemultiply();
        if (s0 === peg$FAILED) {
          s0 = peg$parsedivide();
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepronoun() {
    var s0, s1;

    var key    = peg$currPos * 100 + 59,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c216) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c217); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c218) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c219); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c220) {
          s1 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c221); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c222) {
            s1 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c223); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c224) {
              s1 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c225); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c226) {
                s1 = input.substr(peg$currPos, 3);
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c227); }
              }
              if (s1 === peg$FAILED) {
                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c228) {
                  s1 = input.substr(peg$currPos, 3);
                  peg$currPos += 3;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c229); }
                }
                if (s1 === peg$FAILED) {
                  if (input.substr(peg$currPos, 3).toLowerCase() === peg$c230) {
                    s1 = input.substr(peg$currPos, 3);
                    peg$currPos += 3;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c231); }
                  }
                  if (s1 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c232) {
                      s1 = input.substr(peg$currPos, 3);
                      peg$currPos += 3;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c233); }
                    }
                    if (s1 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c234) {
                        s1 = input.substr(peg$currPos, 3);
                        peg$currPos += 3;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c235); }
                      }
                      if (s1 === peg$FAILED) {
                        if (input.substr(peg$currPos, 2).toLowerCase() === peg$c236) {
                          s1 = input.substr(peg$currPos, 2);
                          peg$currPos += 2;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c237); }
                        }
                        if (s1 === peg$FAILED) {
                          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c238) {
                            s1 = input.substr(peg$currPos, 2);
                            peg$currPos += 2;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c239); }
                          }
                          if (s1 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2).toLowerCase() === peg$c240) {
                              s1 = input.substr(peg$currPos, 2);
                              peg$currPos += 2;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c241); }
                            }
                            if (s1 === peg$FAILED) {
                              if (input.substr(peg$currPos, 2).toLowerCase() === peg$c242) {
                                s1 = input.substr(peg$currPos, 2);
                                peg$currPos += 2;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c243); }
                              }
                              if (s1 === peg$FAILED) {
                                if (input.substr(peg$currPos, 2).toLowerCase() === peg$c244) {
                                  s1 = input.substr(peg$currPos, 2);
                                  peg$currPos += 2;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c245); }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c246(s1);
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseroll() {
    var s0;

    var key    = peg$currPos * 100 + 60,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c247) {
      s0 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c248); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c249) {
        s0 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c250); }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsedelist() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 61,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c249) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c250); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevariable();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c251(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parselookup() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 62,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsedelist();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c252(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsevariable();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c253) {
            s3 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c254); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsenor();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c255(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsevariable();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c256(s1);
        }
        s0 = s1;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecommon_prefix() {
    var s0;

    var key    = peg$currPos * 100 + 63,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c257) {
      s0 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c258); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 1).toLowerCase() === peg$c259) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c260); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c261) {
          s0 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c262); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c263) {
            s0 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c264); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c265) {
              s0 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c266); }
            }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseuppercase_letter() {
    var s0;

    var key    = peg$currPos * 100 + 64,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (peg$c267.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c268); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parselowercase_letter() {
    var s0;

    var key    = peg$currPos * 100 + 65,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (peg$c269.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c270); }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseletter() {
    var s0;

    var key    = peg$currPos * 100 + 66,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parseuppercase_letter();
    if (s0 === peg$FAILED) {
      s0 = peg$parselowercase_letter();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecommon_variable() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 67,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsecommon_prefix();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parse_();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parse_();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parseletter();
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parseletter();
          }
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = input.substring(s3, peg$currPos);
        } else {
          s3 = s4;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c271(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseis() {
    var s0, s1, s2;

    var key    = peg$currPos * 100 + 68,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 2) === peg$c272) {
      s0 = peg$c272;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c273); }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parse_();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parse_();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s2 = peg$c274;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c275); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c276) {
            s2 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c277); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c278) {
              s2 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c279); }
            }
            if (s2 === peg$FAILED) {
              if (input.substr(peg$currPos, 4).toLowerCase() === peg$c280) {
                s2 = input.substr(peg$currPos, 4);
                peg$currPos += 4;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c281); }
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 5).toLowerCase() === peg$c282) {
                  s2 = input.substr(peg$currPos, 5);
                  peg$currPos += 5;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c283); }
                }
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepush() {
    var s0;

    var key    = peg$currPos * 100 + 69,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c284) {
      s0 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c285); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c286) {
        s0 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c287); }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepop() {
    var s0;

    var key    = peg$currPos * 100 + 70,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c249) {
      s0 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c250); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c247) {
        s0 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c248); }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseinto() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 71,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c288) {
        s2 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c289); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseindexer() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 72,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 2).toLowerCase() === peg$c253) {
        s2 = input.substr(peg$currPos, 2);
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c254); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsenor();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c290(s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseassignable() {
    var s0, s1, s2;

    var key    = peg$currPos * 100 + 73,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsevariable();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseindexer();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c291(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseassignment() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    var key    = peg$currPos * 100 + 74,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parseassignable();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseis();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parse_();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parse_();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseliteral();
          if (s4 === peg$FAILED) {
            s4 = peg$parsepoetic_number();
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c292(s1, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseassignable();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parse_();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 5).toLowerCase() === peg$c293) {
            s3 = input.substr(peg$currPos, 5);
            peg$currPos += 5;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c294); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsepoetic_string();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c292(s1, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c295) {
          s1 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c296); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenor();
            if (s3 !== peg$FAILED) {
              s4 = peg$parseinto();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseassignable();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c297(s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c298) {
            s1 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c299); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseassignable();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 2).toLowerCase() === peg$c300) {
                    s5 = input.substr(peg$currPos, 2);
                    peg$currPos += 2;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c301); }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsecompoundable_operator();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsenor();
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c302(s3, s6, s7);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c298) {
              s1 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c299); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parse_();
                }
              } else {
                s2 = peg$FAILED;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parseassignable();
                if (s3 !== peg$FAILED) {
                  s4 = [];
                  s5 = peg$parse_();
                  if (s5 !== peg$FAILED) {
                    while (s5 !== peg$FAILED) {
                      s4.push(s5);
                      s5 = peg$parse_();
                    }
                  } else {
                    s4 = peg$FAILED;
                  }
                  if (s4 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c300) {
                      s5 = input.substr(peg$currPos, 2);
                      peg$currPos += 2;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c301); }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = [];
                      s7 = peg$parse_();
                      if (s7 !== peg$FAILED) {
                        while (s7 !== peg$FAILED) {
                          s6.push(s7);
                          s7 = peg$parse_();
                        }
                      } else {
                        s6 = peg$FAILED;
                      }
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsenor();
                        if (s7 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c303(s3, s7);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsepush();
              if (s1 !== peg$FAILED) {
                s2 = peg$parse_();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parsenor();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parseinto();
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parsevariable();
                      if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c304(s3, s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parsepush();
                if (s1 !== peg$FAILED) {
                  s2 = peg$parse_();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsevariable();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parse_();
                      if (s4 !== peg$FAILED) {
                        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c305) {
                          s5 = input.substr(peg$currPos, 4);
                          peg$currPos += 4;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c306); }
                        }
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parse_();
                          if (s6 !== peg$FAILED) {
                            s7 = peg$parseliteral();
                            if (s7 === peg$FAILED) {
                              s7 = peg$parsepoetic_number();
                            }
                            if (s7 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c307(s3, s7);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parsepush();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parse_();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsevariable();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$currPos;
                        s5 = peg$parse_();
                        if (s5 !== peg$FAILED) {
                          if (input.substr(peg$currPos, 4).toLowerCase() === peg$c308) {
                            s6 = input.substr(peg$currPos, 4);
                            peg$currPos += 4;
                          } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c309); }
                          }
                          if (s6 !== peg$FAILED) {
                            s5 = [s5, s6];
                            s4 = s5;
                          } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                        if (s4 === peg$FAILED) {
                          s4 = null;
                        }
                        if (s4 !== peg$FAILED) {
                          s5 = peg$parse_();
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parsenor();
                            if (s6 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c307(s3, s6);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsepush();
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parse_();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parsevariable();
                        if (s3 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c310(s3);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parsedelist();
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parse_();
                        if (s2 !== peg$FAILED) {
                          if (input.substr(peg$currPos, 4).toLowerCase() === peg$c288) {
                            s3 = input.substr(peg$currPos, 4);
                            peg$currPos += 4;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c289); }
                          }
                          if (s3 !== peg$FAILED) {
                            s4 = peg$parse_();
                            if (s4 !== peg$FAILED) {
                              s5 = peg$parseassignable();
                              if (s5 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c311(s1, s5);
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_string() {
    var s0, s1, s2, s3;

    var key    = peg$currPos * 100 + 75,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = [];
    if (peg$c18.test(input.charAt(peg$currPos))) {
      s3 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c19); }
    }
    while (s3 !== peg$FAILED) {
      s2.push(s3);
      if (peg$c18.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c312(s1);
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_number() {
    var s0, s1, s2, s3, s4, s5, s6;

    var key    = peg$currPos * 100 + 76,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsepoetic_digit_separator();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsepoetic_digit_separator();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsepoetic_digits();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsepoetic_digit_separator();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsepoetic_digit_separator();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsepoetic_decimal();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$parsepoetic_digit_separator();
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              s6 = peg$parsepoetic_digit_separator();
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c313(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_decimal() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 77,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 46) {
      s1 = peg$c122;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c123); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsepoetic_decimal_digit_separator();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsepoetic_decimal_digit_separator();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsepoetic_decimal_digits();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsepoetic_decimal_digit_separator();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsepoetic_decimal_digit_separator();
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c314(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c122;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c123); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsepoetic_decimal_digit_separator();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsepoetic_decimal_digit_separator();
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_digit_separator() {
    var s0;

    var key    = peg$currPos * 100 + 78,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parse_();
    if (s0 === peg$FAILED) {
      if (peg$c315.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c316); }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_digits() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 79,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsepoetic_digit_separator();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsepoetic_digit_separator();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsepoetic_digit();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsepoetic_digit_separator();
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsepoetic_digit_separator();
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsepoetic_digits();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c317(s2, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsepoetic_digit();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c318(s1);
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_decimal_digit_separator() {
    var s0;

    var key    = peg$currPos * 100 + 80,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parse_();
    if (s0 === peg$FAILED) {
      s0 = peg$parsepoetic_digit_separator();
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s0 = peg$c122;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c123); }
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_decimal_digits() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 81,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsepoetic_decimal_digit_separator();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsepoetic_decimal_digit_separator();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsepoetic_digit();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsepoetic_decimal_digit_separator();
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsepoetic_decimal_digit_separator();
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsepoetic_decimal_digits();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c317(s2, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsepoetic_digit();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c318(s1);
      }
      s0 = s1;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsepoetic_digit() {
    var s0, s1, s2;

    var key    = peg$currPos * 100 + 82,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = [];
    if (peg$c319.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c320); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c319.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c320); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c321(s1);
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsevariable() {
    var s0;

    var key    = peg$currPos * 100 + 83,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parsecommon_variable();
    if (s0 === peg$FAILED) {
      s0 = peg$parseproper_variable();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepronoun();
        if (s0 === peg$FAILED) {
          s0 = peg$parsesimple_variable();
        }
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsesimple_variable() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 84,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = peg$parseletter();
    if (s3 !== peg$FAILED) {
      s4 = [];
      s5 = peg$parseletter();
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$parseletter();
      }
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$c322(s1);
      if (s2) {
        s2 = peg$FAILED;
      } else {
        s2 = void 0;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c323(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseproper_noun() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 85,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = peg$parseuppercase_letter();
    if (s3 !== peg$FAILED) {
      s4 = [];
      s5 = peg$parseletter();
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$parseletter();
      }
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$c324(s1);
      if (s2) {
        s2 = peg$FAILED;
      } else {
        s2 = void 0;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c325(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseproper_variable() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    var key    = peg$currPos * 100 + 86,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = peg$parseproper_noun();
    if (s3 !== peg$FAILED) {
      s4 = [];
      s5 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 32) {
        s6 = peg$c326;
        peg$currPos++;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c327); }
      }
      if (s6 !== peg$FAILED) {
        s7 = peg$currPos;
        s8 = peg$parseproper_noun();
        if (s8 !== peg$FAILED) {
          s7 = input.substring(s7, peg$currPos);
        } else {
          s7 = s8;
        }
        if (s7 !== peg$FAILED) {
          s6 = [s6, s7];
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 32) {
          s6 = peg$c326;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c327); }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$currPos;
          s8 = peg$parseproper_noun();
          if (s8 !== peg$FAILED) {
            s7 = input.substring(s7, peg$currPos);
          } else {
            s7 = s8;
          }
          if (s7 !== peg$FAILED) {
            s6 = [s6, s7];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      }
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c328(s1);
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecrement() {
    var s0;

    var key    = peg$currPos * 100 + 87,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parseincrement();
    if (s0 === peg$FAILED) {
      s0 = peg$parsedecrement();
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseincrement() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    var key    = peg$currPos * 100 + 88,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c329) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c330); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevariable();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$currPos;
            if (input.substr(peg$currPos, 2).toLowerCase() === peg$c331) {
              s7 = input.substr(peg$currPos, 2);
              peg$currPos += 2;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c332); }
            }
            if (s7 !== peg$FAILED) {
              s8 = [];
              s9 = peg$parsenoise();
              while (s9 !== peg$FAILED) {
                s8.push(s9);
                s9 = peg$parsenoise();
              }
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            if (s6 !== peg$FAILED) {
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$currPos;
                if (input.substr(peg$currPos, 2).toLowerCase() === peg$c331) {
                  s7 = input.substr(peg$currPos, 2);
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c332); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = [];
                  s9 = peg$parsenoise();
                  while (s9 !== peg$FAILED) {
                    s8.push(s9);
                    s9 = peg$parsenoise();
                  }
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c333(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsedecrement() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    var key    = peg$currPos * 100 + 89,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c334) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c335); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevariable();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$currPos;
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c336) {
              s7 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c337); }
            }
            if (s7 !== peg$FAILED) {
              s8 = [];
              s9 = peg$parsenoise();
              while (s9 !== peg$FAILED) {
                s8.push(s9);
                s9 = peg$parsenoise();
              }
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            if (s6 !== peg$FAILED) {
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$currPos;
                if (input.substr(peg$currPos, 4).toLowerCase() === peg$c336) {
                  s7 = input.substr(peg$currPos, 4);
                  peg$currPos += 4;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c337); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = [];
                  s9 = peg$parsenoise();
                  while (s9 !== peg$FAILED) {
                    s8.push(s9);
                    s9 = peg$parsenoise();
                  }
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c338(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsesplit() {
    var s0, s1;

    var key    = peg$currPos * 100 + 90,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c339) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c340); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c341) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c342); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c343) {
          s1 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c344); }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c345();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsecast() {
    var s0, s1;

    var key    = peg$currPos * 100 + 91,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c346) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c347); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c348) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c349); }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c350();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsejoin() {
    var s0, s1;

    var key    = peg$currPos * 100 + 92,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c351) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c352); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c353) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c354); }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c355();
    }
    s0 = s1;

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsemutator() {
    var s0;

    var key    = peg$currPos * 100 + 93,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parsesplit();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecast();
      if (s0 === peg$FAILED) {
        s0 = peg$parsejoin();
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsemodifier() {
    var s0, s1, s2, s3, s4;

    var key    = peg$currPos * 100 + 94,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c308) {
        s2 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c309); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c356) {
          s2 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c357); }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsenor();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c358(s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsemutation() {
    var s0, s1, s2, s3, s4, s5, s6;

    var key    = peg$currPos * 100 + 95,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    s1 = peg$parsemutator();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenor();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseinto();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseassignable();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsemodifier();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c359(s1, s3, s5, s6);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsemutator();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseassignable();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemodifier();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c360(s1, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parserounding() {
    var s0;

    var key    = peg$currPos * 100 + 96,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$parsefloor();
    if (s0 === peg$FAILED) {
      s0 = peg$parseceil();
      if (s0 === peg$FAILED) {
        s0 = peg$parsemath_round();
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsefloor() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 97,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c361) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c362); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevariable();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c336) {
              s5 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c337); }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c363(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c361) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c362); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 4).toLowerCase() === peg$c336) {
            s3 = input.substr(peg$currPos, 4);
            peg$currPos += 4;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c337); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsevariable();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c363(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parseceil() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 98,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c361) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c362); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevariable();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2).toLowerCase() === peg$c331) {
              s5 = input.substr(peg$currPos, 2);
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c332); }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c364(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c361) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c362); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c331) {
            s3 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c332); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsevariable();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c365(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }

  function peg$parsemath_round() {
    var s0, s1, s2, s3, s4, s5;

    var key    = peg$currPos * 100 + 99,
        cached = peg$resultsCache[key];

    if (cached) {
      peg$currPos = cached.nextPos;

      return cached.result;
    }

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c361) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c362); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevariable();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 5).toLowerCase() === peg$c366) {
              s5 = input.substr(peg$currPos, 5);
              peg$currPos += 5;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c367); }
            }
            if (s5 === peg$FAILED) {
              if (input.substr(peg$currPos, 6).toLowerCase() === peg$c368) {
                s5 = input.substr(peg$currPos, 6);
                peg$currPos += 6;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c369); }
              }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c370(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c361) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c362); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 5).toLowerCase() === peg$c366) {
            s3 = input.substr(peg$currPos, 5);
            peg$currPos += 5;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c367); }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 6).toLowerCase() === peg$c368) {
              s3 = input.substr(peg$currPos, 6);
              peg$currPos += 6;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c369); }
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsevariable();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c370(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

    return s0;
  }


    /* initialiser code - this is JS that runs before the parser is generated */
    const keywords = [
      'mysterious',
      'stronger','continue',
      'between','greater','nothing','nowhere','smaller','whisper','without',
      'ain\'t','around','bigger','listen','nobody','return','scream','taking','weaker','higher', 'strong',
      'break','build','empty','false','great','knock','lower','right','round','shout', 
      'small','take','takes','times','until','unite','while','wrong','minus',
      'aint','back','cast','burn','join','down','else','give','gone','high','into','less','lies','null','plus','says','than','them','they','true','weak','were','your','over','with',
      'and','big','her','him','hir','it ','low','nor','not','put','say','she','the','top','ver','was','xem','yes','zie','zir',
      'an','as','at','he','if','is','it','my','no','of','ok','or','to','up','ve', 'xe','ze',
      'a'
    ]

    function isKeyword(string) {
      return keywords.includes(string.toLowerCase());
    }


  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};

},{}]},{},[2])(2)
});
