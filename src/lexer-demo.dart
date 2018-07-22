import "lexer.dart";

main() {
  demo("Shout 'Hello, World!'", ["shout", '"', "Hello, World!"]);
  demo("Build my world up", ["build", 'my world', "up"]);
  demo("Build my world up", ["build", 'my world', "up"]);
  demo("Build my\n   world up", ["build", 'my world', "up"]);
  demo("Tommy The Pinball Wizard says I'm the best\n", ["Tommy The Pinball Wizard", 'says', '"', "I'm the best"]);
}

demo(String program, List tokens) {
  var lex = new Lexer(program);
  for (int i = 0; i < tokens.length; i++) {
    if (lex.current != tokens[i]) {
      throw "Expected '${tokens[i]}', got '${lex.current}'";
    }
    String token = lex.getNext;
    if (token == '"') {
      i++;
      if (lex.currentString != tokens[i]) {
        throw "Expected '${tokens[i]}', got '${lex.currentString}'";
      }
    }
  }
  if (lex.current != null) throw "Unparsed junk at end";
  print("Lexed '$program' to $tokens");
}
