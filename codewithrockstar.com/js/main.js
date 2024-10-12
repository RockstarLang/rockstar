import {
	EditorView, basicSetup, keymap, Prec,
	// Language definitions
	Rockstar, KitchenSink,
	// themes
	kitchenSink, blackSabbath, espresso, cobalt, dracula, solarizedLight, coolGlow, amy,
	deepPurple
} from './codemirror/editor.js';

const ROCK_BUTTON_HTML = "Rock <i class='fa-solid fa-play'></i>";

const STOP_BUTTON_HTML = "Stop <i class='fa-solid  fa-sync fa-spin'></i>"

var rockCount = 0;
var starshipLoaded = false;

function handleMessageFromWorker(message) {
	console.log(message);
	if (message.data.type == "ready") {
		console.log(message.data.status);
		starshipLoaded = true;
		clearLoadingMessages();
		while (queuedMessages.length) {
			var message = queuedMessages.pop();
			rockCount++;
			worker.postMessage(message);
			console.log(message);
		}
	} else if (message.data.editorId) {
		var output = document.getElementById(`rockstar-output-${message.data.editorId}`);
		if (message.data.type == "output") return output.innerText += message.data.output;
		if (message.data.type == "error") {
			output.innerHTML += `<span class="error">error: ${message.data.error}</span>`;
		} else if (message.data.type == "result") {
			if (output.showResult) output.innerHTML += `<span class="result">&raquo; ${message.data.result}</span>`;
		} else if (message.data.type == "parse") {
			return output.innerText = message.data.result;
		} else {
			console.log(message);
		}
		var button = document.getElementById(`rockstar-button-${message.data.editorId}`);
		button.innerHTML = ROCK_BUTTON_HTML;
		rockCount--;
	} else {
		console.log(message);
	}
}

var worker = new Worker("/js/worker.js", { type: 'module' });
worker.addEventListener("message", handleMessageFromWorker);

var timeouts = [];
var outputs = [];
var queuedMessages = [];

function clearLoadingMessages() {
	while (timeouts.length) window.clearTimeout(timeouts.pop());
	while (outputs.length) {
		var output = outputs.pop();
		output.innerText = "";
		output.classList.remove("loading-messages");
	}
}

function displayLoadingMessages(output) {
	outputs.push(output);
	output.classList.add("loading-messages");
	[
		"Initializing Rockstar engine...",
		"Getting ready to rock...",
		"Downloading WASM runtime...",
		"Writing a set list...",
		"DRUM SOLO!",
		"Pretending to go off stage...",
		"Waiting for audience chant...",
		"ENCORE!",
		"SECOND ENCORE!",
		"THIRD ENCORE!",
		"It really should have loaded by now.",
		"...you're not on 56kbps dial-up, are you?",
		"...you are? Cool. Modem noises <brzzzzt-BEEP-BOOP>",
		"OK, this hasn't worked. Sorry.",
		"Maybe try reloading the page?",
		"...ok, fine. BASS SOLO.",
	].forEach((message, index) => {
		timeouts.push(window.setTimeout(() => output.innerText += message + "\n", 1000 + (1000 * Math.pow(index, 1.5))));
	});
}

function executeProgram(program, editorId, input) {
	var output = document.getElementById(`rockstar-output-${editorId}`);
	var message = { command: "run", program: program, editorId: editorId, input: input };
	if (!starshipLoaded) {
		displayLoadingMessages(output);
		queuedMessages.push(message);
		console.log(queuedMessages);
	} else {
		rockCount++;
		worker.postMessage(message);
	}
}

function parseProgram(program, editorId) {
	worker.postMessage({ command: "parse", program: program, editorId: editorId });
}

function stopTheRock() {
	console.log("STOPPING THE ROCK...");
	clearLoadingMessages();
	worker.terminate();
	worker = new Worker("/js/worker.js", { type: 'module' });
	worker.addEventListener("message", handleMessageFromWorker);
	document.querySelectorAll("button.rock-button").forEach((button) => {
		button.innerHTML = ROCK_BUTTON_HTML;
	})
	rockCount = 0;
}

function makeParseTreeLogger(parser) {
	var textarea = document.getElementById('parseTreeTextarea');
	return function logParseTree(viewUpdate) {
		if (viewUpdate.docChanged) {
			var source = viewUpdate.state.doc.toString();
			logTree(parser.parse(source), textarea);
		}
	};
}

function logTree(tree, targetElement) {
	if (!targetElement) return;
	tree = tree.toString();
	var output = [];
	var indent = "";
	for (var i = 0; i < tree.length; i++) {
		if (tree[i] == ',') {
			output.push(' ');
		} else if (tree[i] == '(') {
			indent += "  ";
			output.push('\n' + indent);
		} else if (tree[i] == ')') {
			indent = indent.substring(2);
			output.push('\n');
			while (tree[i + 1] == ')') {
				indent = indent.substring(2);
				i++;
			}
			output.push(indent);
		} else {
			output.push(tree[i]);
		}
	}
	targetElement.value = output.join('');
}

function makeRockstarRunner(editorId) {
	return function handleCtrlEnter({ state, dispatch }) {
		document.getElementById(`rockstar-button-${editorId}`).click();
		console.log(state);
		console.log(dispatch);
		return true;
	}
}

function replaceElementWithEditor({ editorElement, content, languageSupport, theme, editorId, parseTreeElement }) {
	let language = (languageSupport ? languageSupport() : null);
	let rockstarKeymap = Prec.highest(
		keymap.of([
			{ key: "Ctrl-Enter", mac: "Cmd-Enter", run: makeRockstarRunner(editorId) }
		])
	);
	let extensions = [basicSetup, rockstarKeymap];
	if (language) extensions.push(language);
	if (theme) extensions.push(theme);
	if (language && parseTreeElement) {
		let logger = makeParseTreeLogger(language.language.parser);
		extensions.push(EditorView.updateListener.of(logger.bind(this)));
		logTree(language.language.parser.parse(editorElement.innerText), parseTreeElement);
	}

	const fixedHeightEditor = EditorView.theme({
		".cm-content, .cm-gutter": { minHeight: "60px" }
		//		"&": {height: "300px"},
		//		".cm-scroller": {overflow: "auto"}
	});
	extensions.push(fixedHeightEditor);
	let view = new EditorView({ doc: content, extensions: extensions });
	editorElement.parentNode.insertBefore(view.dom, editorElement);
	editorElement.style.display = "none";
	return view;
}

function createControls(editorId, editorView, originalSource, controls) {
	let div = document.createElement("div");
	div.className = "rockstar-controls";
	let output = document.createElement("div");
	output.className = "output";
	output.showResult = controls.result;
	let rockButton = document.createElement("button");
	rockButton.className = "rock-button";
	let parseButton = document.createElement("button");
	let resetButton = document.createElement("button");
	let buttonContainer = document.createElement("div");
	buttonContainer.className = "buttons";

	rockButton.id = `rockstar-button-${editorId}`;
	output.id = `rockstar-output-${editorId}`;
	rockButton.innerHTML = ROCK_BUTTON_HTML;
	resetButton.innerHTML = "Reset <i class='fa-solid fa-rotate-right'></i>";
	parseButton.innerHTML = "Parse <i class='fa-solid fa-list-tree'></i>";
	parseButton.onclick = () => {
		let source = editorView.state.doc.toString();
		output.classList.add("parse-tree");
		try {
			parseProgram(source, editorId);
		} catch (e) {
			console.log(e);
		}
	}
	rockButton.onclick = () => {
		output.classList.remove("parse-tree");
		console.log(rockCount);
		if (rockCount > 0) {
			stopTheRock();
		} else {
			rockButton.innerHTML = STOP_BUTTON_HTML;
			output.innerText = "";
			let source = editorView.state.doc.toString();
			let inputTextarea = document.getElementById(`rockstar-input-${editorId}`);
			let input = inputTextarea ? inputTextarea.value : "";
			try {
				executeProgram(source, editorId, input);
			} catch (e) {
				console.log(e);
			}
		}
	}
	resetButton.onclick = evt => {
		output.classList.remove("parse-tree");
		output.innerText = "";
		editorView.dispatch({
			changes: {
				from: 0,
				to: editorView.state.doc.length,
				insert: originalSource
			}
		});
	}
	buttonContainer.appendChild(rockButton);
	buttonContainer.appendChild(resetButton);
	if (controls.parse) buttonContainer.appendChild(parseButton);
	div.appendChild(buttonContainer);
	div.appendChild(output);
	return div;
}

let options = ["play", "parse", "reset", "input", "result"];

function configureControls(preElement) {
	let list = (preElement.getAttribute("data-controls") ?? "").split(",");
	let controls = {};
	for (var option of options) controls[option] = true;
	if (list.length == 1 && list[0] == '') return controls;
	if (list.includes("all")) return controls;
	for (var option of options) controls[option] = list.includes(option);
	return controls;
}

var editorId = 1;
document.querySelectorAll(('code.language-rockstar')).forEach((codeElement) => {
	let preElement = codeElement.parentElement;
	let controls = configureControls(preElement);
	editorId++;
	var originalSource = codeElement.innerText;
	var settings = {
		content: originalSource,
		editorElement: preElement,
		parseTreeTextarea: document.getElementById('parseTreeTextarea'),
		language: Rockstar, // Rockstar
		theme: deepPurple, // kitchenSink
		editorId: editorId
	};
	var editorView = replaceElementWithEditor(settings);
	if (controls.input) {
		let inputDiv = document.createElement("div");
		inputDiv.className = "rockstar-inputs";
		let label = document.createElement("label");
		label.setAttribute("for", `rockstar-input-${editorId}`);
		label.innerText = "Input:";
		let input = document.createElement("textarea");
		input.id = `rockstar-input-${editorId}`;
		input.className = "rockstar-stdin";
		input.placeholder = "Does your program need input from stdin? Paste it here.";
		// input.value = "";
		inputDiv.appendChild(label);
		inputDiv.appendChild(input);
		preElement.parentNode.insertBefore(inputDiv, preElement);
	}
	var controlPanel = createControls(editorId, editorView, originalSource, controls);
	preElement.parentNode.insertBefore(controlPanel, preElement);
});

document.querySelectorAll(('code.language-kitchen-sink')).forEach((codeElement) => {
	let preElement = codeElement.parentElement;
	editorId++;
	var content = codeElement.innerText;
	// kitchenSink, blackSabbath, espresso, cobalt, dracula, solarizedLight, coolGlow, amy
	let extensions = [ basicSetup, KitchenSink(), deepPurple ];
	let view = new EditorView({ doc: content, extensions: extensions });
	preElement.parentNode.insertBefore(view.dom, preElement);
	preElement.style.display = "none";
	return view;
});


