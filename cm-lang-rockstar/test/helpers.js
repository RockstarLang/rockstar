import { parser } from "../src/grammars/rockstar.js";

// The leaf tokens of a parse, as [nodeName, text] pairs, skipping whitespace
// and statement terminators unless asked for.
export function tokens(source, { keepTerminators = false } = {}) {
	const result = [];
	const tree = parser.parse(source);
	tree.iterate({
		enter(node) {
			if (node.type.isError) result.push(["⚠", source.slice(node.from, node.to)]);
			if (node.node.firstChild) return;
			if (!keepTerminators && ["EOS", "Noise"].includes(node.name)) return;
			if (node.from == node.to && node.name != "EOB") return;
			result.push([node.name, source.slice(node.from, node.to)]);
		}
	});
	return result;
}

// The name of the token covering the given text in the source.
export function tokenFor(source, text) {
	const found = tokens(source).find(([, t]) => t == text);
	return found ? found[0] : undefined;
}

export const tree = source => parser.parse(source).toString();

export function errors(source) {
	const result = [];
	parser.parse(source).iterate({
		enter(node) {
			if (node.type.isError) {
				const line = source.slice(0, node.from).split("\n").length;
				result.push(`line ${line}: ${JSON.stringify(source.split("\n")[line - 1])}`);
			}
		}
	});
	return result;
}
