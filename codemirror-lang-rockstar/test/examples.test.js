import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from 'url';
import { errors } from "./helpers.js";

// Every Rockstar program in the engine's own test suite should parse without
// errors, apart from the ones that are there to test error handling.
const testDir = path.dirname(fileURLToPath(import.meta.url));
const programs = path.join(testDir, "../../Starship/Rockstar.Test/programs/");

const rockFiles = fs.readdirSync(programs, { recursive: true })
	.filter(file => /\.rock$/.test(file))
	.filter(file => !fs.readFileSync(path.join(programs, file), "utf8").includes("(error: "));

test("found the test programs", () => expect(rockFiles.length).toBeGreaterThan(200));

test.each(rockFiles)("%s parses without errors", file => {
	const source = fs.readFileSync(path.join(programs, file), "utf8");
	expect(errors(source)).toEqual([]);
});
