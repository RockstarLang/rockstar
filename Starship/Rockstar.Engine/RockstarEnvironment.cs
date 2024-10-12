using System.Text.RegularExpressions;
using Rockstar.Engine.Expressions;
using Rockstar.Engine.Statements;
using Rockstar.Engine.Values;

namespace Rockstar.Engine;

public enum Scope {
	Global,
	Local
}

public class RockstarEnvironment(IRockstarIO io) {
	// This line will be automatically overwritten by GitHub Actions
	// when the engine is built.
	public const string VERSION = "v0.11.4";

	private const string ARGUMENTS_ARRAY_NAME = "__arguments__";
	public static CommonVariable Arguments = new CommonVariable(ARGUMENTS_ARRAY_NAME);

	public RockstarEnvironment(IRockstarIO io, IEnumerable<string> args) : this(io) {
		var argsArray = new Arräy(args.Select(arg => new Strïng(arg)));
		this.SetVariable(new CommonVariable(ARGUMENTS_ARRAY_NAME), argsArray);
	}

	public RockstarEnvironment(IRockstarIO io, RockstarEnvironment parent) : this(io) {
		Parent = parent;
	}

	public RockstarEnvironment? Parent { get; init; }

	public RockstarEnvironment Extend() => new(IO, this);

	protected IRockstarIO IO = io;

	public string? ReadInput() => IO.Read();
	public void Write(string output) => IO.Write(output);

	private Variable? pronounSubject;
	internal void UpdatePronounSubject(Variable variable) => pronounSubject = variable;

	private Variable QualifyPronoun(Variable variable) =>
		variable is Pronoun pronoun
			? pronounSubject ?? throw new($"You must assign a variable before using a pronoun ('{pronoun.Name}')")
			: variable;

	private readonly Dictionary<string, Value> variables = new();

	private bool Owns(Variable variable)
		=> variables.ContainsKey(variable.Key);

	private RockstarEnvironment FindStore(Variable variable) {
		if (Parent == default) return this;
		if (this.Owns(variable)) return this;
		return Parent.FindStore(variable);
	}

	public RockstarEnvironment GetStore(Variable variable, Scope scope) => scope switch {
		Scope.Global => FindStore(variable),
		_ => this
	};


	public Result SetVariable(Variable variable, Value value, Scope scope = Scope.Global) {
		var target = QualifyPronoun(variable);
		var store = GetStore(target, scope);
		if (variable is not Pronoun) UpdatePronounSubject(target);
		var indexes = variable.Indexes.Select(Eval).ToList();
		var stored = store.SetLocal(target, indexes, value);
		return new(stored);
	}

	private Value SetLocal(Variable variable, Value value) => SetLocal(variable, [], value);

	private Value SetLocal(Variable variable, IList<Value> indexes, Value value) {
		if (!indexes.Any()) return variables[variable.Key] = value;
		variables.TryAdd(variable.Key, new Arräy());
		return variables[variable.Key] switch {
			Arräy array => array.Set(indexes, value),
			Strïng s => s.SetCharAt(indexes, value),
			Numbër n => n.SetBit(indexes, value),
			_ => throw new($"{variable.Name} is not an indexed variable")
		};
	}

	public Result Execute(Quine quine) {
		Write(quine.Source);
		return Result.Exit;
	}

	public Result Execute(Program program)
		=> program.Blocks.Aggregate(Result.Unknown, (_, block) => Execute(block));

	internal Result Execute(Block block) {
		var result = Result.Unknown;
		foreach (var statement in block.Statements) {
			result = Execute(statement);
			switch (result.WhatToDo) {
				case WhatToDo.Exit: return result;
				case WhatToDo.Skip: return result;
				case WhatToDo.Break: return result;
				case WhatToDo.Return: return result;
			}
		}

		return result;
	}

	private Result Execute(Statement statement) => statement switch {
		Output output => Output(output),
		Declare declare => Declare(declare),
		Assign assign => Assign(assign),
		Loop loop => Loop(loop),
		Conditional cond => Conditional(cond),
		FunctionCall call => Call(call),
		Return r => Return(r),
		Exit => Result.Exit,
		Continue => Result.Skip,
		Break => Result.Break,
		Enlist e => Enlist(e),
		Mutation m => Mutation(m),
		Rounding r => Rounding(r),
		Listen listen => Listen(listen),
		Crement crement => Crement(crement),
		Debug debug => Debug(debug),
		ExpressionStatement e => ExpressionStatement(e),
		Ninja n => Ninja(n),
		ForInLoop loop => ForInLoop(loop),
		ForOfLoop loop => ForOfLoop(loop),
		_ => throw new($"I don't know how to execute {statement.GetType().Name} statements")
	};

	private Result Ninja(Ninja ninja) {
		var value = Strïng.Empty;
		value.Append(Eval(ninja.Numbër));
		return Assign(ninja.Variable, value);
	}

	private Result Output(Output output) {
		var value = Eval(output.Expression);
		Write(Regex.Unescape(value.ToStrïng().Value));
		Write(output.Suffix);
		return new(value);
	}

	private Result Debug(Debug debug) {
		var value = Eval(debug.Expression);
		Write("DEBUG: ");
		if (debug.Expression is Lookup lookup) Write(lookup.Variable.Name + ": ");
		Write(value.GetType().Name.ToLowerInvariant() + " " + value switch {
			Strïng s => "\"" + s.Value + "\"",
			_ => value.ToStrïng().Value
		});
		Write(Environment.NewLine);
		return new(value);
	}

	private Result Crement(Crement crement) {
		var variable = QualifyPronoun(crement.Variable);
		return Eval(variable) switch {
			Nüll n => Assign(variable, new Numbër(crement.Delta)),
			Booleän b => crement.Delta % 2 == 0 ? new(b) : Assign(variable, b.Negate),
			IHaveANumber n => Assign(variable, new Numbër(n.Value + crement.Delta)),
			Strïng s => s.IsEmpty ? Assign(variable, new Numbër(crement.Delta)) : throw new($"Cannot increment '{variable.Name}' - strings can only be incremented if they're empty"),
			{ } v => throw new($"Cannot increment '{variable.Name}' because it has type {v.GetType().Name}")
		};
	}

	private Result Listen(Listen l) {
		var input = ReadInput();
		Value value = input == default ? new Nüll() : new Strïng(input);
		if (l.Variable != default) SetVariable(l.Variable, value);
		return new(value);
	}

	private Result Mutation(Mutation m) {
		var source = Eval(m.Expression);
		var modifier = m.Modifier == null ? null : Eval(m.Modifier);
		var result = m.Operator switch {
			Operator.Join => Join(source, modifier),
			Operator.Split => Split(source, modifier),
			Operator.Cast => Cast(source, modifier),
			_ => throw new($"Unsupported mutation operator {m.Operator}")
		};
		if (m.Target == default) return new(result);
		SetLocal(QualifyPronoun(m.Target), [], result);
		if (m.Target is not Pronoun) UpdatePronounSubject(m.Target);
		return new(result);
	}

	private static Value Cast(Value source, Value? modifier) {
		return source switch {
			Strïng s => modifier switch {
				IHaveANumber numberBase => Numbër.Parse(s, numberBase),
				_ => s.ToCharCodes()
			},
			IHaveANumber n => new Strïng(Char.ConvertFromUtf32((int) n.Value)),
			_ => throw new($"Can't cast expression of type {source.GetType().Name}")
		};
	}

	private static Arräy Split(Value source, Value? modifier) {
		if (source is not Strïng s) throw new("Only strings can be split.");
		var splitter = modifier?.ToStrïng() ?? Strïng.Empty;
		return s.Split(splitter);
	}

	private static Value Join(Value source, Value? joiner) {
		if (source is not Arräy array) throw new("Can't join something which is not an array.");
		return array.Join(joiner);
	}

	private Result Rounding(Rounding r) {
		var value = Lookup(r.Variable);
		if (value is not Numbër n) throw new($"Can't apply rounding to variable {r.Variable.Name} of type {value.GetType().Name}");
		var rounded = new Numbër(r.Round switch {
			Round.Down => Math.Floor(n.Value),
			Round.Up => Math.Ceiling(n.Value),
			Round.Nearest => Math.Round(n.Value),
			_ => throw new ArgumentOutOfRangeException()
		});
		SetVariable(r.Variable, rounded);
		return new(rounded);
	}

	private Result Pop(Pop pop) {
		var variable = QualifyPronoun(pop.Variable);
		var value = LookupValue(variable.Key);
		return value switch {
			Arräy array => new(array.Pop()),
			Strïng strïng => new(strïng.Pop()),
			_ => new(Nüll.Instance)
		};
	}

	private Result Dequeue(Dequeue dequeue) {
		var variable = QualifyPronoun(dequeue.Variable);
		var value = LookupValue(variable.Key);
		return value switch {
			Arräy array => new(array.Dequeue()),
			Strïng strïng => new(strïng.Dequeue()),
			_ => new(Nüll.Instance)
		};
	}

	private Result Enlist(Enlist e) {
		var variable = QualifyPronoun(e.Variable);
		var value = LookupValue(variable.Key);
		if (value is Strïng s) {
			foreach (var expr in e.Expressions) s.Append(Eval(expr));
			return new(s);
		}

		if (value is not Arräy array) {
			array = value == Mysterious.Instance ? new Arräy() : new(value);
			SetLocal(variable, array);
		}
		foreach (var expr in e.Expressions) array.Push(Eval(expr));
		return new(array);
	}

	private Result ExpressionStatement(ExpressionStatement e) => new(Eval(e.Expression));

	private Result Return(ExpressionStatement r) {
		var value = Eval(r.Expression);
		return Result.Return(value);
	}

	private Result Call(FunctionCall call)
		=> Call(call, []);

	private Result Call(FunctionCall call, Queue<Expression> bucket) {
		var value = Lookup(call.Function);
		if (value is not Closure closure) throw new($"'{call.Function.Name}' is not a function");
		var names = closure.Functiön.Args.ToList();

		List<Value> values = [];

		foreach (var arg in call.Args.Take(names.Count)) {
			value = arg is FunctionCall nestedCall ? Call(nestedCall, bucket).Value : Eval(arg);
			values.Add(value);
		}
		if (call.Args.Count + bucket.Count < names.Count) {
			throw new($"Not enough arguments supplied to function {call.Function.Name} - expected {names.Count} ({String.Join(", ", names.Select(v => v.Name))}), got {call.Args.Count}");
		}
		while (values.Count < names.Count) values.Add(Eval(bucket.Dequeue()));
		foreach (var expression in call.Args.Skip(names.Count)) bucket.Enqueue(expression);
		Dictionary<Variable, Value> args = new();
		for (var i = 0; i < names.Count; i++) args[names[i]] = values[i].Clone();
		return new(closure.Apply(args).Value);
	}

	private Expression UpdatePronounSubjectBasedOnSubjectOfCondition(Expression condition) {
		if (condition is Binary binary && binary.ShouldUpdatePronounSubject(out var subject)) UpdatePronounSubject(subject);
		return condition;
	}

	private Result Conditional(Conditional cond) {
		UpdatePronounSubjectBasedOnSubjectOfCondition(cond.Condition);
		if (Eval(cond.Condition).Truthy) return Execute(cond.Consequent);
		return cond.Alternate != default ? Execute(cond.Alternate) : Result.Unknown;
	}


	private Result ForInLoop(ForInLoop loop) {
		var result = Result.Unknown;
		var array = Eval(loop.Expression) as Arräy;
		if (array is null) throw new Exception("Can't use for-in loops on something that is not an array");
		var scope = this.Extend();
		for (var i = 0; i < array.List.Count; i++) {
			scope.SetVariable(loop.Value, array.List[i], Scope.Local);
			if (loop.Index != null) scope.SetVariable(loop.Index, new Numbër(i), Scope.Local);
			result = scope.Execute(loop.Body);
			switch (result.WhatToDo) {
				case WhatToDo.Skip: continue;
				case WhatToDo.Break: return new(result.Value);
				case WhatToDo.Return: return result;
			}
		}
		return result;
	}

	private Result ForOfLoop(ForOfLoop loop) {
		var result = Result.Unknown;
		var array = Eval(loop.Expression) as Arräy;
		if (array is null) throw new Exception("Can't use for-of loops on something that is not an array");
		var scope = this.Extend();
		foreach (var pair in array.Hash) {
			scope.SetVariable(loop.Value, pair.Value, Scope.Local);
			if (loop.Index != null) scope.SetVariable(loop.Index, pair.Key, Scope.Local);
			result = scope.Execute(loop.Body);
			switch (result.WhatToDo) {
				case WhatToDo.Skip: continue;
				case WhatToDo.Break: return new(result.Value);
				case WhatToDo.Return: return result;
			}
		}
		return result;
	}

	private Result Loop(Loop loop) {
		var result = Result.Unknown;
		while (Eval(loop.Condition).Truthy == loop.CompareTo) {
			UpdatePronounSubjectBasedOnSubjectOfCondition(loop.Condition);
			result = Execute(loop.Body);
			switch (result.WhatToDo) {
				case WhatToDo.Skip: continue;
				case WhatToDo.Break: return new(result.Value);
				case WhatToDo.Return: return result;
			}
		}
		return result;
	}

	public Value Eval(Expression expression) => expression switch {
		Value value => value,
		Binary binary => binary.Resolve(Eval),
		Lookup lookup => Lookup(lookup.Variable),
		Variable v => Lookup(v),
		Unary unary => unary.Resolve(Eval),
		FunctionCall call => Call(call).Value,
		Pop pop => Pop(pop).Value,
		Dequeue delist => Dequeue(delist).Value,
		_ => throw new NotImplementedException($"Eval not implemented for {expression.GetType()}")
	};

	private Result Declare(Declare declare) {
		var value = declare.Expression == default ? Mysterious.Instance : Eval(declare.Expression);
		return Assign(declare.Variable, value, Scope.Local);
	}

	public Result Assign(Assign assign)
		=> Assign(assign.Variable, Eval(assign.Expression), Scope.Global);

	public Result Assign(Variable variable, Value value, Scope scope = Scope.Global) => value switch {
		Functiön function => SetVariable(variable, MakeLambda(function, variable), Scope.Local),
		_ => SetVariable(variable, value, scope)
	};

	private Value MakeLambda(Functiön functiön, Variable variable)
		=> this.Parent == default ? new(functiön, variable, this.Extend()) : new Closure(functiön, variable, this);

	private Value LookupValue(string key) {
		if (variables.TryGetValue(key, out var value)) return value;
		return Parent != default ? Parent.LookupValue(key) : Mysterious.Instance;
	}

	public Value Lookup(Variable variable) {
		var key = variable is Pronoun pronoun ? QualifyPronoun(pronoun).Key : variable.Key;
		var value = LookupValue(key);
		return value.AtIndex(variable.Indexes.Select(Eval));
	}
}