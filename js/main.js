import { classIf } from "../common/dom.js";
import { openModal, closeModal, clearModals, confirm } from "../util/modal.js";
import loadPuzzle, { isTodaysPuzzle, puzzleId } from "../common/daily.js";
import $ from "../util/dom.js";
import storage from "../common/data.js";

import '../common/dark.js';

import './cube.js';
import './radios.js';

const { cube } = $;

cube.onUpdate = ({ undoStack, state, full, solved }) => {
	if (solved) {
		// TODO
	}
	if (isTodaysPuzzle) {
		storage.undoStack = undoStack.map(({ cell, state }) => ({ cell: cube.cells.indexOf(cell), state }));
		storage.savedState = {
			puzzleId,
			state: state.map(({ pen, pencil, highlight }, i) => {
				if (cube.cells[i].isClue) return { h: highlight, isClue: true };
				if (pen !== null) return { h: highlight, pen: pen };
				return { h: highlight, pencil: pencil.reduce((a, n) => (a << 1) | n) };
			})
		};
	}
};

function button(id, cb) {
	document.getElementById(id).addEventListener('click', cb);
}

const initialState = storage.savedState;
const initialUndoStack = storage.undoStack;
loadPuzzle().then(json => {
	cube.usePuzzle(json);
	if (isTodaysPuzzle && initialState?.puzzleId == puzzleId) {
		cube.undoStack = initialUndoStack.map(({ cell, state }) => ({ cell: cube.cells[cell], state }));
		initialState.state.forEach(({ h: highlight, pencil, pen, isClue }, i) => {
			const cell = cube.cells[i];
			if (highlight) cell.input.classList.add(`highlight-${highlight}`);
			if (isClue) return;
			if (pen) cell.value = pen;
			for (let i = 0; i < 16; ++i) cell.setPencil(i, !!(pencil & (1 << i)));
		});
	}
});

window.addEventListener('scroll', e => spinCube());
spinCube(0.5);
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
button('undo', e => cube.popUndo());
button('reveal-solution', async e => {
	if (!await confirm("Reveal the answers?")) return;
	for (const c of cube.cells) c.value = c.answer;
	cube.pushUndo();
	closeModal();
});
button('assistance', e => openModal('assistance-modal'));
button('help', e => openModal('help-modal'));
button('options', e => openModal('options-modal'));
button('close-instructions', e => clearModals());
button('close-assistance', e => closeModal());
button('close-options', e => closeModal());
// TODO: when the pencil tool is selected (or when you change the pencil value) highlight all cells that COULD be that number
fixSize();

function spinCube(x) {
	const w = $.scroller.clientWidth - (document.body.scrollWidth || window.scrollWidth);
	if (x === undefined) x = document.scrollingElement.scrollLeft * 3 / w;
	else document.scrollingElement.scrollLeft = window.scrollX = x * w / 3;
	if (x > 2) spinCube(x - 1);
	else if (x < 1) spinCube(x + 1);
	else cube.rotation = x;
}

window.addEventListener('resize', debounce(fixSize));

function debounce(fn, t = 300) {
	let h;
	return () => {
		if (h) clearTimeout(h);
		h = setTimeout(fn, t);
	};
}

function fixSize() {
	// ok so what we have to do is make sure the cube render fits in the box
	// it's rendered at 100vmin regardless of the box size so we just have to fit that in
	const renderSize = Math.min(window.innerWidth, window.innerHeight);
	const idealSize = Math.min(cube.clientWidth, cube.clientHeight);
	cube.style.transform = `scale(${ idealSize / renderSize })`;
}

storageCheck('autopencil');
storageCheck('showErrors');
function storageCheck(id) {
	const input = $[id];
	input.checked = storage[id] == true; // this is often a string so the type coersion is useful here
	input.addEventListener('change', e => storage[id] = input.checked);
}
