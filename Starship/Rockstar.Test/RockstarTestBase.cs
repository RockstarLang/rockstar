namespace Rockstar.Test;

public abstract class RockstarTestBase(ITestOutputHelper testOutput) {

	protected readonly Parser Parser = new();

	protected (Result Result, string Output) RunProgram(string program, Queue<string>? inputs = null)
		=> RunProgram(Parser.Parse(program), inputs);

	protected (Result Result, string Output) RunProgram(Program program, Queue<string>? inputs = null) {
		string? ReadInput() => inputs != null && inputs.TryDequeue(out var result) ? result : null;
		var env = new TestEnvironment(ReadInput);
		var result = env.Execute(program);
		return (result, env.Output);
	}
}
