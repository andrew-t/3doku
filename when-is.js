#!/usr/bin/env node

function whenIsPuzzle(n) {
	return new Date(new Date('2023-03-13').getTime()
		+ n * 24 * 60 * 60 * 1000);
}

function whatPuzzleIsOn(date) {
	return Math.floor(
		(new Date(date) - new Date('2023-03-13'))
		/ (24 * 60 * 60 * 1000)
	) + 1;
}

if (process.argv.length != 3) {
	console.log("error: you must supply a number");
}

const id = parseInt(process.argv[2], 10);
const date = whenIsPuzzle(id);
console.log(`Puzzle ${id} is on ${date.toDateString()}`);
