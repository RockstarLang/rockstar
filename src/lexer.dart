import "package:charcode/ascii.dart";

class Lexer {
  Lexer(this._program) {
    get();
  }
  String _program;
  String current;
  String currentString;
  int _pos = 0;
  void accept(String something) {
    assert(current == something);
    get();
  }

  String get getNext {
    String answer = current;
    get();
    return answer;
  }

  bool _isWhiteSpace(int c) => c == $space || c == $ht || c == $vt || c == $lf || c == $cr || c == $ff;

  int _codeUnit(int index) {
    return _program.codeUnitAt(index);
  }

  void get() {
    bool whitespace = true;
    while (whitespace && _pos < _program.length) {
      int c = _codeUnit(_pos);
      if (!_isWhiteSpace(c)) whitespace = false;
      else _pos++;
    }
    if (_pos == _program.length) {
      current = null;
      return;
    }
    if (current == "says") {
      getPoeticString();
      return;
    }
    int c = _codeUnit(_pos);
    if (c == $double_quote) {
      getString($double_quote);
      return;
    } else if (c == $single_quote) {
      getString($single_quote);
      return;
    } else if (c >= $A && c <= $Z) {
      getProperVariable();
    } else if (c >= $0 && c <= $9) {
      getNumber();
    } else {
      getToken();
      // "Baby" doesn't change the meaning of a rock song, so get the next
      // token.
      if (current == "baby" || current == "Baby") get();
    }
  }

  void getPoeticString() {
    int start = _pos;
    while (true) {
      if (_pos == _program.length || _codeUnit(_pos) == $lf) {
        currentString = _program.substring(start, _pos);
        current = '"';
        return;
      }
      _pos++;
    }
  }

  void getNumber() {
    int r = 0;
    int c = _codeUnit(_pos++);
    while (true) {
      r *= 10;
      r += c - $0;
      if (_pos == _program.length) {
        current = r;
        return;
      }
      c = _codeUnit(_pos);
      if (c < $0 || c > $9) {
        current = r;
        return;
      }
    }
  }

  // Returns null if it's not a possessive.
  bool getPossessive(String s) {
    if (s == "my" || s == "My") return "my";
    if (s == "the" || s == "The") return "the";
    if (s == "your" || s == "Your") return "your";
    return null;
  }

  var keywords = {
    "true": "true",
    "Build": "build",
    "build": "build",
    "Shout": "shout",
    "shout": "shout",
    "says": "says"
  };

  void getToken() {
    int start = _pos;
    while (_pos < _program.length) {
      int c = _codeUnit(_pos);
      if (_isWhiteSpace(c)) {
        current = _program.substring(start, _pos);
        String possessive = getPossessive(current);
        if (possessive != null) {
          get();
          if (current == '"') error("Literal string after $possessive");
          if (current is int) error("Integer after $possessive");
          int c = current.codeUnitAt(0);
          if ($A <= c && c <= $Z) error("Proper name after $possessive");
          current = "$possessive $current";
        }
        return;
      }
      _pos++;
    }
    current = _program.substring(start, _pos);
  }

  bool _nextTokenStartsWithCapital() {
    int p = _pos;
    while (p < _program.length) {
      int c = _codeUnit(p);
      if (_isWhiteSpace(c)) {
        p++;
        continue;
      }
      return $A <= c && c <= $Z;
    }
    return false;
  }

  void getProperVariable() {
    int start = _pos;
    var chars = null;
    while (_pos < _program.length) {
      int c = _codeUnit(_pos);
      if (_isWhiteSpace(c)) {
        String so_far = _program.substring(start, _pos);
        if (keywords.containsKey(so_far)) {
          current = keywords[so_far];
          return;
        }
        if (!_nextTokenStartsWithCapital()) {
          if (chars == null) {
            current = so_far;
          } else {
            current = new String.fromCharCodes(chars);
          }
          return;
        } else {
          chars = _makeCharArray(start, _pos, chars);
          chars.add($space);
          while (_isWhiteSpace(_codeUnit(_pos))) _pos++;
          continue;
        }
      }
      if (chars != null) chars.add(c);
      _pos++;
    }
    if (chars == null) {
      current = _program.substring(start, _pos);
    } else {
      current = new String.fromCharCodes(chars);
    }
  }

  _makeCharArray(int from, int to, chars) {
    if (chars != null) return chars;
    chars = [];
    for (int i = 0; i < to - from; i++) {
      chars.add(_codeUnit(from + i));
    }
    return chars;
  }

  void getString(delimiter) {
    _pos++;
    int start = _pos;
    var chars = null;
    while (_pos < _program.length) {
      int c = _codeUnit(_pos);
      if (c == $backslash) {
        _pos += 2;
        if (_pos > _program.length) error("File ends in backslash");
        chars = _makeCharArray(start, _pos, chars);
        c = _codeUnit(_pos - 1);
        if (c == $n) chars.add($new_line);
        else if (c == $r) chars.add($cr);
        else if (c == $t) chars.add($ht);
        else if (c == $backslash) chars.add($backslash);
        else if (c == $single_quote) chars.add($single_quote);
        else if (c == $double_quote) chars.add($double_quote);
        else if (c == $0) chars.add(0);
        else error("Unknown escape in string literal");
        continue;
      }
      if (c == delimiter) {
        if (chars == null) {
          currentString = _program.substring(start, _pos);
        } else {
          currentString = new String.fromCharCodes(chars);
        }
        _pos++;
        current = '"';
        return;
      }
      if (chars != null) chars.add(c);
      _pos++;
    }
    _pos = start;
    _error("Unterminated string");
  }
}
