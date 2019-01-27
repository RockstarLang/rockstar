module.exports = {
    Environment: Environment,
    eq: eq
}

const MYSTERIOUS = '__MYSTERIOUS__';

function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
    this.output = (parent && parent.output ? parent.output : console.log);
    this.readline = () => "";
}

Environment.prototype = {
    extend: function () { return new Environment(this) },
    find_scope: function (name) {
        let scope = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope;
            scope = scope.parent;
        }
    },

    lookup: function (name) {
        if (name in this.vars)
            return this.vars[name];
        throw new Error("Undefined variable " + name);
    },

    assign: function (name, value) {
        // THIS is where we control whether assignment inside a function call
        // can overwrite variables declared in a parent frame.
        let scope = this.find_scope(name);
        return (scope || this).vars[name] = value;
    },

    def: function (name, value) {
        return this.vars[name] = value;
    },

    run: function(program) {
        return evaluate(program, this);
    },
    pronoun_alias: null,
    pronoun_value: null,
}

 function evaluate(tree, env, flag) {
     if (tree == MYSTERIOUS) return(undefined);
     let list = Object.entries(tree)
     for (let i = 0; i < list.length; i++) {
         let node = list[i];
         let type = node[0];
         let expr = node[1];
         switch (type) {
             case "list":
                 let result = null;
                 main: for (let i = 0; i < expr.length; i++) {
                     let next = expr[i];
                     result = evaluate(next, env, true);
                     if (result) switch(result.action) {
                         case 'break':
                             console.log('break from list');
                             break main;
                         case 'continue':
                             console.log('continue from list');
                             continue main;
                         case 'return':
                             return (result.value);
                     }
                 }
                 return;
             case "conditional":
                 if (evaluate(expr.condition, env)) {
                     return evaluate(expr.consequent, env, flag)
                 } else if (expr.alternate) {
                     return evaluate(expr.alternate, env, flag);
                 }
                 return;
             case 'break':
                 if (flag) {
                     console.log('BREAK');
                     return { 'action' : 'break' };
                 }
                 return;
             case 'continue':
                 if (flag) return { 'action' : 'continue' };
                 return;
             case "return":
                 if (flag) return {
                     'action': 'return',
                     'value': evaluate(expr.expression, env, flag)
                 };
                 return evaluate(expr.expression, env, flag);
             case "number":
             case "string":
             case "constant":
                 return (expr);
             case "output":
                 let printable = evaluate(expr, env, flag);
                 if (typeof (printable) == 'undefined') printable = "mysterious";
                 env.output(printable);
                 return;
             case "listen":
                 return env.readline();
             case "binary":
                 return binary(expr, env);
             case "lookup":
                 if (expr.variable.pronoun) return (env.pronoun_value);
                 env.pronoun_alias = expr.variable;
                 return env.pronoun_value = env.lookup(expr.variable);
             case "assign":
                 let alias = "";
                 let value = evaluate(expr.expression, env);
                 if (expr.variable.pronoun) {
                     alias = env.pronoun_alias;
                 } else {
                     alias = expr.variable;
                     env.pronoun_alias = alias;
                     env.pronoun_value = value;
                 }
                 env.assign(alias, value);
                 return;
             case "pronoun":
                 return env.pronoun_value;
             case "blank":
                 return;
             case "increment":
                 let old_increment_value = env.lookup(expr.variable);
                 switch (typeof (old_increment_value)) {
                     case "boolean":
                         if (expr.multiple % 2 != 0) env.assign(expr.variable, !old_increment_value);
                         return;
                     default:
                         env.assign(expr.variable, (old_increment_value + expr.multiple));
                         return;
                 }
                 return;
             case "decrement":
                 let old_decrement_value = env.lookup(expr.variable);
                 switch (typeof (old_decrement_value)) {
                     case "boolean":
                         if (expr.multiple % 2 != 0) env.assign(expr.variable, !old_decrement_value);
                         return;
                     default:
                         env.assign(expr.variable, (old_decrement_value - expr.multiple));
                         return;
                 }
                 return;

             case "while_loop":
                 while_outer: while (evaluate(expr.condition, env, flag)) {
                     let result = evaluate(expr.consequent, env, flag);
                     console.log(JSON.stringify(result));
                     if (result) switch(result.action) {
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
                 until_outer: while (!evaluate(expr.condition, env, flag)) {
                     let result = evaluate(expr.consequent, env, flag);
                     console.log(JSON.stringify(result));
                     if (result) switch(result.action) {
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
                 let lhs = evaluate(expr.lhs, env, flag);
                 let rhs = evaluate(expr.rhs, env, flag);
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
             case "and":
                 return (evaluate(expr.lhs, env, flag) && evaluate(expr.rhs, env, flag));
             case "nor":
                 return (!evaluate(expr.lhs, env, flag) && !evaluate(expr.rhs, env, flag));
             case "or":
                 return (evaluate(expr.lhs, env, flag) || evaluate(expr.rhs, env, flag));
             case "not":
                 return (!evaluate(expr.expression, env, flag));
             case "function":
                 env.assign(expr.name, make_lambda(expr, env, flag));
                 return;
             case "call":
                 let func = env.lookup(expr.name);
                 return func.apply(null, expr.args.map(arg => evaluate(arg, env, flag)));
             default:
                 throw new Error("Sorry - I don't know how to evaluate this: " + JSON.stringify(tree))

         }
     }
 }

 function eq(lhs, rhs) {
     if (typeof(lhs) == 'undefined') return(typeof(rhs) == 'undefined');
     if (typeof(rhs) == 'undefined') return(typeof(lhs) == 'undefined');

     if (typeof(lhs) == 'boolean') return(eq_boolean(lhs, rhs));
     if (typeof(rhs) == 'boolean') return(eq_boolean(rhs, lhs));
     if (typeof(lhs) == 'number') return(eq_number(lhs, rhs));
     if (typeof(rhs) == 'number') return(eq_number(rhs, lhs));

    return lhs == rhs;
 }

 function eq_number(number, other) {
    if (other == null || typeof(other) == 'undefined') return(number === 0);
    return(other == number);
 }

 function eq_boolean(bool, other) {
    // false equals null in Rockstar
    if (other == null) other = false;
    // false equals zero in Rockstar
    if(typeof(other) == 'number') other = (other !== 0);
    if (typeof(other) == 'string') other = (other !== "");
    return (bool == other);
 }

 function make_lambda(expr, env) {
     function lambda() {
         let names = expr.args;
         if (names.length != arguments.length) throw('Wrong number of arguments supplied to function ' + expr.name + ' (' + expr.args + ')');
         let scope = env.extend();
         for (let i = 0; i < names.length; ++i) scope.def(names[i], arguments[i])
         return evaluate(expr.body, scope);
     }

     return lambda;
 }

 function binary(b, env) {
     let l = evaluate(b.left, env);
     let r = evaluate(b.right, env);
     switch (b.op) {
         case '+':
             return l + r;
         case '-':
             return l - r;
         case '/':
             return l / r;
         case '*':
             return l * r;
     }
 }