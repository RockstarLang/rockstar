using Rockstar.Engine;

namespace Rockstar;

public class ConsoleIO : IRockstarIO {
	public string? Read() => Console.ReadLine();
	public void Write(string? s) => Console.Write(s);
	public void WriteLine(string s) => Console.WriteLine(s);
}
