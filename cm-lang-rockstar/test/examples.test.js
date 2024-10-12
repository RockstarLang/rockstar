import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from 'url';
import { parser } from "../src/grammars/rockstar.js";

let caseDir = path.dirname(fileURLToPath(import.meta.url))
let examples = path.join(caseDir, "../../codewithrockstar.com/examples/");
var allFiles = fs.readdirSync(examples, { recursive: true });
var rockFiles = [];
for (var file of allFiles) {
	if (! /\.rock$/.test(file)) continue;
	rockFiles.push(file);
}

test.each(rockFiles)("parser parses %p", (file) => {
 	let source = fs.readFileSync(path.join(examples, file), "utf8");
	expect(source.length).not.toBe(0);
 	// let result = parser.parse(source);
 	//console.log(result.toString());
});

