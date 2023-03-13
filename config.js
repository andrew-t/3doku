import { SYSTEM } from "./util/dark.js";

export const launchDate = '2023-03-13';
export const namespace = '3doku';

export const defaults = {
	streak: 0,
	nextPuzzle: 0,
	bestStreak: 0,
	results: {},
	savedState: { puzzleId: -1 },
	dark: SYSTEM,
	reducedMotion: SYSTEM,
	undoStack: [],
	autopencil: false,
	showErrors: false,
	pencilHighlighting: true,
	pencilOnLaunch: false,
};

export const noExport = ['undoStack'];

export const exportTransforms = {
	savedState: ({ state, ...rest }) => ({
		...rest,
		state: state.map(({ isClue, highlight, pencil, pen }) => {
			let str = highlight?.substring(0, 1).toUpperCase() ?? "";
			if (isClue) return `${str}C`;
			if (pen != undefined) return `${str}I${pen.toString(16)}`;
			return `${str}L${pencil.toString(16)}`;
		}).join("")
	}),
	results: object => {
		const keys = Object.keys(object).map(parseFloat);
		const max = Math.max(...keys);
		const array = [];
		for (let i = 1; i <= max; ++i)
			array[i - 1] = object[i] ?? 0;
		return array.join('');
	}
};

const colours = ['red', 'green', 'blue', 'yellow', 'purple', 'teal', 'orange', 'none'];

export const importTransforms = {
	savedState: ({ state, ...rest }) => ({
		...rest,
		state: state.split(/([ROYGTBP]?[CIL][0-9a-f]*)/g).filter(x => x).map(str => {
			let [highlight, mode, value] = str.split(/([CIL])/);
			highlight = colours.find(k => k[0] == highlight);
			value = parseInt(value, 16);
			switch (mode) {
				case "C": return { highlight, isClue: true };
				case "I": return { highlight, pen: value };
				case "L": return { highlight, pencil: value };
				default: throw new Error("Parse error");
			}
		})
	}),
	results: string => {
		const val = {};
		for (let i = 0; i < string.length; ++i)
			val[i + 1] = parseInt(string[i]);
		return val;
	}
};
