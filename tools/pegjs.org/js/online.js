$(document).ready(function() {
  var KB      = 1024;
  var MS_IN_S = 1000;

  var parser;

  var buildAndParseTimer = null;
  var parseTimer         = null;

  var oldGrammar        = null;
  var oldParserVar      = null;
  var oldOptionCache    = null;
  var oldOptionOptimize = null;
  var oldInput          = null;
 
  var editor = CodeMirror.fromTextArea($("#grammar").get(0), {
      lineNumbers: true,
      mode: "pegjs"
  });

  window.editor = editor;

  function buildSizeAndTimeInfoHtml(title, size, time) {
    return $("<span/>", {
      "class": "size-and-time",
      title:   title,
      html:    (size / KB).toPrecision(2) + "&nbsp;kB, "
                 + time + "&nbsp;ms, "
                 + ((size / KB) / (time / MS_IN_S)).toPrecision(2) + "&nbsp;kB/s"
    });
  }

  function buildErrorMessage(e) {
    return e.location !== undefined
      ? "Line " + e.location.start.line + ", column " + e.location.start.column + ": " + e.message
      : e.message;
  }

  function build() {
    oldGrammar        = getGrammar();
    oldParserVar      = $("#parser-var").val();
    oldOptionCache    = $("#option-cache").is(":checked");
    oldOptionOptimize = $("#option-optimize").val();

    $('#build-message').attr("class", "message progress").text("Building the parser...");
    $("#input").attr("disabled", "disabled");
    $("#parse-message").attr("class", "message disabled").text("Parser not available.");
    $("#output").addClass("disabled").text("Output not available.");
    $("#parser-var").attr("disabled", "disabled");
    $("#option-cache").attr("disabled", "disabled");
    $("#option-optimize").attr("disabled", "disabled");
    $("#parser-download").attr("disabled", "disabled");

    try {
      var timeBefore = (new Date).getTime();
      var parserSource = peg.generate(getGrammar(), {
        cache:    $("#option-cache").is(":checked"),
        optimize: $("#option-optimize").val(),
        output:   "source"
      });
      var timeAfter = (new Date).getTime();

      parser = eval(parserSource);

      $("#build-message")
        .attr("class", "message info")
        .html("Parser built successfully.")
        .append(buildSizeAndTimeInfoHtml(
          "Parser build time and speed",
          getGrammar().length,
          timeAfter - timeBefore
        ));
      $("#input").removeAttr("disabled");
      $("#parser-source").val($("#parser-var").val() + " = " + parserSource + ";\n");
      $("#parser-var").removeAttr("disabled");
      $("#option-cache").removeAttr("disabled");
      $("#option-optimize").removeAttr("disabled");
      $("#parser-download").removeAttr("disabled");

      var result = true;
    } catch (e) {
      $("#build-message").attr("class", "message error").text(buildErrorMessage(e));

      var result = false;
    }

    doLayout();
    return result;
  }

  function parse() {
    oldInput = $("#input").val();

    $("#input").removeAttr("disabled");
    $("#parse-message").attr("class", "message progress").text("Parsing the input...");
    $("#output").addClass("disabled").text("Output not available.");

    try {
      var timeBefore = (new Date).getTime();
      var output = parser.parse($("#input").val());
      var timeAfter = (new Date).getTime();

      $("#parse-message")
        .attr("class", "message info")
        .text("Input parsed successfully.")
        .append(buildSizeAndTimeInfoHtml(
          "Parsing time and speed",
          $("#input").val().length,
          timeAfter - timeBefore
        ));
      let json = jsDump.parse(output);
      json = json.replace(/ *[{}],? */g, '');
      json = json.replace(/\n([ \t]*\n)*/g, '\n');

      $("#output").removeClass("disabled").text(json);

      var result = true;
    } catch (e) {
      $("#parse-message").attr("class", "message error").text(buildErrorMessage(e));

      var result = false;
    }

    doLayout();
    return result;
  }

  function buildAndParse() {
    console.log('buildAndParse()');
    build() && parse();
  }

  function scheduleBuildAndParse() {
    var nothingChanged = getGrammar() === oldGrammar
      && $("#parser-var").val() === oldParserVar
      && $("#option-cache").is(":checked") === oldOptionCache
      && $("#option-optimize").val() === oldOptionOptimize;
      if (nothingChanged) { return; }

    if (buildAndParseTimer !== null) {
      clearTimeout(buildAndParseTimer);
      buildAndParseTimer = null;
    }
    if (parseTimer !== null) {
      clearTimeout(parseTimer);
      parseTimer = null;
    }

    buildAndParseTimer = setTimeout(function() {
      buildAndParse();
      buildAndParseTimer = null;
    }, 500);
  }

  function scheduleParse() {
    if ($("#input").val() === oldInput) { return; }
    if (buildAndParseTimer !== null) { return; }

    if (parseTimer !== null) {
      clearTimeout(parseTimer);
      parseTimer = null;
    }

    parseTimer = setTimeout(function() {
      parse();
      parseTimer = null;
    }, 500);
  }

  function doLayout() {
    /*
     * This forces layout of the page so that the |#columns| table gets a chance
     * make itself smaller when the browser window shrinks.
     */
    $("#left-column").height("0px");    // needed for IE
    $("#right-column").height("0px");   // needed for IE
    $(".CodeMirror").height("0px");
    $("#input").height("0px");

    $("#left-column").height(($("#left-column").parent().innerHeight() - 2) + "px");     // needed for IE
    $("#right-column").height(($("#right-column").parent().innerHeight() - 2) + "px");   // needed for IE
    $(".CodeMirror").height(($(".CodeMirror").parent().parent().innerHeight() - 14) + "px");
    $("#input").height(($("#input").parent().parent().innerHeight() - 14) + "px");
  }

  function getGrammar() {
    return editor.getValue();
  }

  editor.on("change", scheduleBuildAndParse);

  $("#parser-var, #option-cache, #option-optimize")
    .change(scheduleBuildAndParse)
    .mousedown(scheduleBuildAndParse)
    .mouseup(scheduleBuildAndParse)
    .click(scheduleBuildAndParse)
    .keydown(scheduleBuildAndParse)
    .keyup(scheduleBuildAndParse)
    .keypress(scheduleBuildAndParse);

  $("#input")
    .change(scheduleParse)
    .mousedown(scheduleParse)
    .mouseup(scheduleParse)
    .click(scheduleParse)
    .keydown(scheduleParse)
    .keyup(scheduleParse)
    .keypress(scheduleParse);

  doLayout();
  $(window).resize(doLayout);

  $("#loader").hide();
  $("#content").show();

  $("#grammar, #parser-var, #option-cache, #option-optimize").removeAttr("disabled");
  
  buildAndParse();

  editor.refresh();
  editor.focus();
});
