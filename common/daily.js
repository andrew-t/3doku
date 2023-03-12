import storage from "./data.js";
import { initQuery } from "../util/query.js";
import $ from "../util/dom.js"
import { launchDate } from "../config.js";
import getJson from "../util/json.js";

const parts = launchDate.split('-').map(x => parseInt(x, 10));
--parts[1]; // months are 0-indexed
const oneDay = 1000 * 60 * 60 * 24;
const epoch = Date.UTC(...parts);
export const todaysPuzzleId = Math.floor((Date.now() - epoch) / oneDay + 1);
export const puzzleId = initQuery.p ?? todaysPuzzleId.toString();
export const isTodaysPuzzle = puzzleId == todaysPuzzleId;

// these are numbers to keep data exports at a manageable size
export const UNPLAYED = 0;
export const PLAYED = 1;
export const COMPLETED = 2;
export const CHEATED = 3;
export const FAILED = 4;

export const levels = {
	100: "Very easy",
	200: "Very easy",
	300: "Easy",
	400: "Medium",
	500: "Tricky",
	600: "Hard",
	700: "Fiendish"
};

if (isTodaysPuzzle) {
	$.jumpToToday.classList.add('hidden');
	$.todayNext.classList.add('hidden');
	runTimer($.nextPuzzle);
} else {
	$.nextPuzzleContainer.classList.add('hidden');
}

function updateStreakDom() {
	$.currentStreak.innerHTML = storage.nextPuzzle >= todaysPuzzleId ? storage.streak : 0;
	$.bestStreak.innerHTML = storage.bestStreak;
	$.currentStreak2.innerHTML = storage.streak;
	$.bestStreak2.innerHTML = storage.bestStreak;
	$.completionPercent.innerHTML = Math.floor(
		Object.values(storage.results).reduce((a, n) => a + (n == COMPLETED), 0) * 100 / todaysPuzzleId
	) + "%";
}
updateStreakDom();

export default async function loadPuzzle() {
	if (!/^\d+\+?$/.test(puzzleId)) throw new Error("Invalid puzzle code");
	if (/^\d+$/.test(puzzleId) && parseInt(puzzleId, 10) > todaysPuzzleId)
		throw new Error("Puzzle not available yet");
	const strictId = puzzleId.replace(/\+/,'');
	$.puzzleId.appendChild(document.createTextNode('#' + strictId));
	try {
		const json = await getJson(`puzzles/${strictId}.json`);
		$.closeInstructions.innerHTML = isTodaysPuzzle ? "Start" : `Start puzzle #${puzzleId}`;
		$.closeInstructions.disabled = false;
		return json;
	} catch (e) {
		console.error(e);
		alert("Unable to load puzzle data");
	}
}

const textResults = {
	[PLAYED]: "👀",
	[COMPLETED]: "🎉",
	undefined: "✨",
	[UNPLAYED]: "✨",
	[CHEATED]: "🔮",
	[FAILED]: "💀"
};

function optionText(i, difficulty) {
	return textResults[storage.results[i]] + " " +
		(i == todaysPuzzleId ? 'Today’s Puzzle': `Puzzle ${i}`)
		+ " (" + levels[difficulty] + ")";
}

getJson(`puzzles/difficulties.json?p=${todaysPuzzleId}`).then(difficulties => {
	for (let i = todaysPuzzleId; i; --i) {
		const el = document.createElement('option');
		el.value = i;
		el.appendChild(document.createTextNode(optionText(i, difficulties[i - 1])));
		$.game.appendChild(el);
	}
	$.game.value = puzzleId;
	$.game.addEventListener('change', (e) => {
		const i = e.target.value;
		if (i) window.location.search = `?p=${i}`;
	});
});

function setResult(result) {
	storage.results = {
		...storage.results,
		[puzzleId]: result
	};
	if (isTodaysPuzzle) updateStreak(result);
	const option = document.querySelector(`option[value="${puzzleId}"]`);
	if (option) option.innerHTML = optionText(puzzleId);
	updateStreakDom();
}

function updateStreak(result) {
	switch (result) {
		case COMPLETED:
			const intPId = parseInt(puzzleId, 10);
			if (storage.nextPuzzle == intPId)
				storage.streak += 1;
			else if (intPId > storage.nextPuzzle)
				storage.streak = 1;
			break;
		case CHEATED:
		case FAILED:
			storage.streak = 0;
			break;
		default: return; // no streak things happen unless the game ended
	}
	if (storage.streak > storage.bestStreak) storage.bestStreak = storage.streak;
	storage.nextPuzzle = todaysPuzzleId + 1;
}

export function onStart() {
	if (!storage.results[puzzleId]) setResult(PLAYED);
}
export function onCheat() {
	if (storage.results[puzzleId] !== COMPLETED) setResult(CHEATED);
}
export function onWin() {
	if (storage.results[puzzleId] !== CHEATED) setResult(COMPLETED);
}

function runTimer(el) {
	const h = setInterval(update, 1000);
	update();
	function update() {
		const ms = epoch + todaysPuzzleId * oneDay - Date.now(),
			s = ~~(ms / 1000);
		if (s < 0) {
			$.todayNext.classList.remove('hidden');
			$.nextPuzzleContainer.classList.add('hidden');
			clearInterval(h);
		} else
			el.innerHTML = `${pad(~~(s/3600))}:${pad(~~(s/60)%60)}:${pad(s%60)}`;
	}
}
function pad(n) { return n > 9 ? `${n}` : `0${n}` }
