using Pegasus.Common;
using Rockstar.Engine.Statements;
using Rockstar.Engine.Values;

namespace Rockstar.Engine;

public class Parser {
	private readonly PegParser pegParser = new();

	public Program Parse(string source) {
		try {
			return pegParser.Parse(source);
		} catch (FormatException ex) {
			if (ex.Data["cursor"] is Cursor cursor) throw new ParserException(cursor, ex);
			throw;
		}
	}
}

public class ParserException : Exception {
	public ParserException(Cursor cursor, FormatException ex) : base(cursor.FormatError(ex), ex) {
		this.Line = cursor.Line;
		this.Column = cursor.Column;
		this.Token = cursor.ErrorToken() ?? "";
	}

	public string Token { get; set; }

	public int Column { get; set; }

	public int Line { get; set; }
}

public class Result(Value value, WhatToDo whatToDo = WhatToDo.Next) {
	public override string ToString() => WhatToDo switch {
		WhatToDo.Return => $"value: {value}",
		WhatToDo.Skip => "skip",
		WhatToDo.Break => "break",
		WhatToDo.Next => "next",
		WhatToDo.Exit => "exit",
		_ => "unknown"
	};

	public Value Value => value;
	public WhatToDo WhatToDo => whatToDo;
	public static Result Skip => new(new Nüll(), WhatToDo.Skip);
	public static Result Break => new(new Nüll(), WhatToDo.Break);
	public static Result Unknown = new(new Nüll(), WhatToDo.Unknown);
	public static Result Return(Value value) => new(value, WhatToDo.Return);
	public static Result Exit => new(new Nüll(), WhatToDo.Exit);
}
