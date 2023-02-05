import { SYSTEM } from "./util/dark.js";

export const launchDate = new Date().toISOString().substring(0, 10); //'2023-01-30';
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
	showErrors: false
};

export const noExport = ['undoStack'];

export const exportTransforms = {
	results: object => {
		const keys = Object.keys(object).map(parseFloat);
		const max = Math.max(...keys);
		const array = [];
		for (let i = 1; i <= max; ++i)
			array[i - 1] = object[i] ?? 0;
		return array.join('');
	}
};

export const importTransforms = {
	results: string => {
		const val = {};
		for (let i = 0; i < string.length; ++i)
			val[i + 1] = parseInt(string[i]);
		return val;
	}
};
