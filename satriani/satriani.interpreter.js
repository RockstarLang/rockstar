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

    lookup: function (name) {
        if (name in this.vars)
            return this.vars[name];
        throw new Error("Undefined variable " + name);
    },

    assign: function (name, value) {
        return this.vars[name] = value;
    },

    def: function (name, value) {
        return this.vars[name] = value;
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
    if (tree == MYSTERIOUS) return (undefined);
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
                let printable = evaluate(expr, env);
                if (typeof (printable) == 'undefined') printable = "mysterious";
                env.output(printable);
                return;
            case "listen":
                return env.input();
            case "binary":
                return binary(expr, env);
            case "lookup":
                let lookup_name = env.dealias(expr);
                return env.lookup(lookup_name);
            case "assign":
                let alias = "";
                let value = evaluate(expr.expression, env);
                if (expr.variable.pronoun) {
                    alias = env.pronoun_alias;
                } else {
                    alias = expr.variable;
                    env.pronoun_alias = alias;
                }
                env.assign(alias, value);
                return;
            case "pronoun":
                return env.lookup(env.pronoun_alias);
            case "blank":
                return;
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
                }
            case "not":
                return (!evaluate(expr.expression, env));
            case "function":
                env.assign(expr.name, make_lambda(expr, env));
                return;
            case "call":
                let func = env.lookup(expr.name);
                let func_result = func.apply(null, expr.args.map(arg => evaluate(arg, env)));
                return (func_result ? func_result.value : undefined);
            default:
                if (Array.isArray(tree) && tree.length == 1) return (evaluate(tree[0], env));
                throw new Error("Sorry - I don't know how to evaluate this: " + JSON.stringify(tree))

        }
    }
}

function demystify(expr, env) {
    let result = evaluate(expr, env);
    if (typeof (result) == 'undefined') return ('mysterious');
    return (result);
}

function eq(lhs, rhs) {
    if (typeof (lhs) == 'undefined') return (typeof (rhs) == 'undefined');
    if (typeof (rhs) == 'undefined') return (typeof (lhs) == 'undefined');

    if (typeof (lhs) == 'boolean') return (eq_boolean(lhs, rhs));
    if (typeof (rhs) == 'boolean') return (eq_boolean(rhs, lhs));
    if (typeof (lhs) == 'number') return (eq_number(lhs, rhs));
    if (typeof (rhs) == 'number') return (eq_number(rhs, lhs));

    return lhs == rhs;
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
        for (let i = 0; i < names.length; ++i) scope.def(names[i], arguments[i])
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
