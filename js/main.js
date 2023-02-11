import { classIf } from "../common/dom.js";
import { openModal, closeModal, clearModals, confirm } from "../util/modal.js";
import loadPuzzle, { isTodaysPuzzle, puzzleId, onStart, onCheat, onWin } from "../common/daily.js";
import $ from "../util/dom.js";
import storage from "../common/data.js";

import '../common/dark.js';

import './cube.js';
import './radios.js';

const { cube } = $;

// Save and load the day's state. Also check if the game is over:
let showResultsModalOnCompletion = true;
loadPuzzle().then(json => {
	cube.usePuzzle(json);
	if (isTodaysPuzzle && storage.savedState?.puzzleId == puzzleId) {
		cube.undoStack = storage.undoStack.map(({ cell, state }) => ({ cell: cube.cells[cell], state }));
		storage.savedState.state.forEach(({ h: highlight, pencil, pen, isClue }, i) => {
			const cell = cube.cells[i];
			if (highlight) cell.input.classList.add(`highlight-${highlight}`);
			if (isClue) return;
			if (pen != null) cell.value = pen;
			for (let i = 0; i < 16; ++i) cell.setPencil(i, !!(pencil & (1 << i)));
		});
	}
	cube.onUpdate = ({ undoStack, state, full, solved }) => {
		if (solved) {
			onWin();
			$.tool.disable(['pen', 'pencil'], 'none');
			if (showResultsModalOnCompletion) openModal('result');
			showResultsModalOnCompletion = false;
			$.reset.classList.add('hidden');
			$.undo.classList.add('hidden');
			$.showResult.classList.remove('hidden');
		}
		if (isTodaysPuzzle) {
			storage.undoStack = undoStack.map(({ cell, state }) => ({ cell: cube.cells.indexOf(cell), state }));
			storage.savedState = {
				puzzleId,
				state: state.map(({ pen, pencil, highlight }, i) => {
					if (cube.cells[i].isClue) return { h: highlight, isClue: true };
					if (pen !== null) return { h: highlight, pen: pen };
					return { h: highlight, pencil: pencil.reduceRight((a, n) => (a << 1) | n) };
				})
			};
			if (cube.cells.some(c => c.value !== null && c.value != c.answer))
				onCheat();
		}
	};
});

// Wire up the UI buttons:
function button(id, cb) {
	document.getElementById(id).addEventListener('click', cb);
}
button('fill-in-pencil', async e => {
	let prompt = "Fill in all possibilities in pencil?";
	if (cube.cells.some(c => c.value === null && c.pencil.some(p => p)))
		prompt += " This will remove your existing pencil marks.";
	if (await confirm(prompt)) {
		cube.fillInPencilMarks();
		cube.pushUndo();
		closeModal();
	}
});
button('reset', async e => {
	if (!await confirm("Remove all your working out so far?")) return;
	cube.reset();
	cube.pushUndo();
});
$.tool.addEventListener('change', e => {
	classIf($.pencilValue, 'hidden', e.value != 'pencil');
	classIf($.highlightColour, 'hidden', e.value != 'highlight');
	classIf($.buttons, 'hidden', e.value == 'pencil' || e.value == 'highlight');
	cube.setTool(e.value);
});
$.pencilValue.addEventListener('change', e => cube.setPencilValue($.pencilValue.value));
button('undo', e => cube.popUndo());
button('reveal-solution', async e => {
	let prompt = "Reveal the answers?";
	if (isTodaysPuzzle) prompt += ' This will break your streak.';
	if (!await confirm(prompt)) return;
	onCheat();
	showResultsModalOnCompletion = false;
	for (const c of cube.cells) c.value = c.answer;
	cube.pushUndo();
	closeModal();
});
button('assistance', e => openModal('assistance-modal'));
button('help', e => openModal('help-modal'));
button('keyboard-controls', e => openModal('keyboard-modal'));
button('options', e => openModal('options-modal'));
button('show-result', e => openModal('result'));
button('close-instructions', e => {
	onStart();
	clearModals();
});
button('close-assistance', e => closeModal());
button('close-options', e => closeModal());
button('close-result', e => closeModal());
button('close-keyboard-modal', e => closeModal());

// Wire up the horizontal scrollbar to the cube's rotation:
window.addEventListener('scroll', e => spinCube());
spinCube(0.5);
function spinCube(x) {
	const w = $.scroller.clientWidth - (document.body.scrollWidth || window.scrollWidth);
	if (x === undefined) x = document.scrollingElement.scrollLeft * 3 / w;
	else document.scrollingElement.scrollLeft = window.scrollX = x * w / 3;
	if (x > 2) spinCube(x - 1);
	else if (x < 1) spinCube(x + 1);
	else cube.rotation = x;
}

// Force the cube to render at a reasonable size:
window.addEventListener('resize', fixSize);
fixSize();
function fixSize() {
	cube.style.transform = `scale(${
		Math.min(cube.clientWidth, cube.clientHeight) /
		Math.min(window.innerWidth, window.innerHeight)
	})`;
}

// Wire up checkboxes that should be saved between sessions:
storageCheck('autopencil');
storageCheck('showErrors');
function storageCheck(id) {
	const input = $[id];
	input.checked = storage[id] == true; // this is often a string so the type coersion is useful here
	input.addEventListener('change', e => storage[id] = input.checked);
}
