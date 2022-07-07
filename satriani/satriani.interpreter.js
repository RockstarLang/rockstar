const fs = require('fs');
const path = require('path');
const parser = require('./satriani.parser.js');

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

    lookup: function (name, index) {
        if (name in this.vars == false) {
            throw new Error("Undefined variable " + name);
        }
        let variable = this.vars[name];
        if (Array.isArray(variable)) {
            if (typeof (index) == 'undefined' || index == null) {
                return variable;
            }
            return variable[index];
        }
        if (typeof (variable) == 'string' && typeof (index) == 'number') {
            return (variable[index]);
        }
        return variable;
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
        if (!this.exists("thy_name")) {
            // This script is not an import; it's executed directly.
            this.assign("thy_name", "", null, 1);
        }
        let result = evaluate(program, this);
        return (result ? result.value : undefined);
    },

    dealias: function (expr) {
        if (expr.variable.pronoun) return this.pronoun_alias;
        return (expr.variable);
    },

    pronoun_alias: null,
}

function toScalar(value) {
    if (Array.isArray(value)) {
        return value.length;
    }
    return value;
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
                if (toScalar(evaluate(expr.condition, env))) {
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
                let printable = toScalar(evaluate(expr, env));
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
                while_outer: while (toScalar(evaluate(expr.condition, env))) {
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
                until_outer: while (!toScalar(evaluate(expr.condition, env))) {
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
                        return (toScalar(lhs) < toScalar(rhs));
                    case "le":
                        return (toScalar(lhs) <= toScalar(rhs));
                    case "ge":
                        return (toScalar(lhs) >= toScalar(rhs));
                    case "gt":
                        return (toScalar(lhs) > toScalar(rhs));
                    default:
                        throw new Error(`Unknown comparison operator ${expr.comparator}`);
                }
            case "not":
                return (!toScalar(evaluate(expr.expression, env)));
            case "function":
                env.assign(expr.name, make_lambda(expr, env));
                return;
            case "call":
                let func = env.lookup(expr.name);
                let func_result = func.apply(null, expr.args.map(arg => {
                    let value =  evaluate(arg, env);
                    // If the arg is an array, we shallow-copy it when passing it to a function call
                    return (value && value.map ? value.map(e => e) : value);                
                }));
                return (func_result ? func_result.value : undefined);
            case "enlist":
                return enlist(expr, env);
            case "delist":
                return delist(expr, env);
            case "import_utils":
                // Load library and inject requested symbols in the 'local=1' environment
                let includeEnv = include(expr.library.name, env);
                for (i = 0; i < expr.utils.length; ++i) {
                    let util = expr.utils[i];
                    if (util.name.startsWith("thy_")) {
                      throw ("System variables won't be imported: '"+util.name+"'");
                    }
                    if (includeEnv.exists(util.name)) {
                        env.assign(util.new_name, includeEnv.vars[util.name], null, 1);
                    } else {
                      throw ("The library '"+expr.library.name+"' does not contain the symbol '"+util.name+"'");
                    }
                }
                return;
            case "import_libraries":
                for (i = 0; i < expr.libraries.length; ++i) {
                    let library = expr.libraries[i];
                    // Load each library and inject all symbols in the 'local=1' environment
                    let includeEnv = include(library.name, env);
                    for (const [k, v] of Object.entries(includeEnv.vars)) {
                        if (!k.startsWith("thy_")) {// Do not retrieve system variables
                            env.assign(k, v, null, 1);
                        }
                    }
                }
                return;
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
            if (Array.isArray(source)) return String.fromCharCode(toScalar(source));
            throw new Error(`I don't know how to cast ${source}`);
        case "join":
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
    let source = env.lookup(name, null)
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
    if (Array.isArray(other)) return ((array.length == other.length) && array.every((el, ix) => eq(el, other[ix])));
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
        case "and": return (toScalar(evaluate(b.lhs, env)) && toScalar(evaluate(b.rhs, env)));
        case "nor": return (!toScalar(evaluate(b.lhs, env)) && !toScalar(evaluate(b.rhs, env)));
        case "or": return (toScalar(evaluate(b.lhs, env)) || toScalar(evaluate(b.rhs, env)));
        case '+': return add(b.lhs, b.rhs, env);
        case '-': return subtract(b.lhs, b.rhs, env);
        case '/': return divide(b.lhs, b.rhs, env);
        case '*': return multiply(b.lhs, b.rhs, env);
    }
}

function add(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs]).reduce((acc, val) => acc += toScalar(demystify(val, env)), toScalar(demystify(lhs, env)));
}

function subtract(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs]).reduce((acc, val) => acc -= toScalar(evaluate(val, env)), toScalar(evaluate(lhs, env)));
}

function divide(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs]).reduce((acc, val) => acc /= toScalar(evaluate(val, env)), toScalar(evaluate(lhs, env)));
}

function multiply(lhs, rhs, env) {
    return (rhs.reduce ? rhs : [rhs])
        .map(expr => toScalar(evaluate(expr, env)))
        .reduce(multiply_reduce, toScalar(evaluate(lhs, env)));
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

function include(name, env) {
    let filename = resolve_include_file(name, env);
    // Parse the file
    let data = fs.readFileSync(filename, 'utf8');
    let ast = parser.parse(data);
    // Interpret the AST
    let includeEnv = new Environment();
    includeEnv.input = env.input;
    includeEnv.output = env.output;
    includeEnv.assign("thy_location", filename, null, 1);
    includeEnv.assign("thy_name", name, null, 1);
    includeEnv.run(ast);// We don't care about a return value.
    return includeEnv;
}

function resolve_include_file(name, env) {
    let currentRockFilename = null;
    if (env.exists("thy_location")) {
        // Each file must know its location, to find it's relative rock libraries
        currentRockFilename = env.vars["thy_location"];
    } else {
        // Best effort: including in the current path will probably fail
        currentRockFilename = path.join(thy_dirname, "anonymous.rock");
    }
    let currentRockDirname = path.dirname(currentRockFilename);
    let files = fs.readdirSync(currentRockDirname);
    let filename = null;
    basename_i = name + ".rock";
    for (i = 0; i < files.length; ++i) {
        let file = files[i];
        if (file.toLowerCase() === basename_i) {
            filename = path.join(currentRockDirname, file);
            if (filename === currentRockFilename) throw ("The file '"+currentRockFilename+"' is including itself");
            break;
        }
    }
    if (filename == null) throw ("Include file not found: " + path.join(currentRockDirname, basename_i));
    return path.resolve(filename);// Absolute path
}