import { shadowDom, el, classIf } from "../common/dom.js";
import './cell.js';
import { reducedMotion } from "../common/dark.js";
import $, { styles } from "../util/dom.js";

export default class Cube extends HTMLElement {
	constructor() {
		super();

		shadowDom(this, `
			${styles}
			<div class="cube-root" id="root"></div>
		`);

		this.groups = [];
		for (let i = 0; i < 12; ++i)
			this.groups.push(new Group(`band-${~~(i / 4)}`));
		for (let i = 0; i < 6; ++i)
			this.groups.push(new Group(`face`));

		this.faces = [];
		this.cells = [];
		for (let f = 0; f < 6; ++f) {
			const table = el(null, `table.face.f${f}`);
			this.root.appendChild(table);
			const tbody = el(this.faces[f] = table, 'tbody');
			for (let r = 0; r < 4; ++r) {
				const tr = el(tbody, 'tr');
				for (let c = 0; c < 4; ++c) {
					const cell = el(el(tr, 'td'), 'doku-cell');
					this.cells.push(cell);
					cell.cube = this;
					cell.input.addEventListener('focus', e => this.lastFocus = cell);
					for (const n of bands(f, r, c))
						this.groups[n].addCell(cell);
				}
			}
		}

		this.undoStack = [];

		this.addEventListener('focus', e => {
			const cell = this.lastFocus ?? this.cells[0];
			cell.input.focus();
			this.spinToCell(cell);
		});
	}

	cellAt(face, x, y) {
		return this.cells[(face << 4) + (y << 2) + x];
	}

	usePuzzle({ answers, moves, clues }) {
		for (let i = 0; i < 96; ++i) this.cells[i].answer = answers[i];
		for (const c of clues) this.cells[c].makeClue();
		this.reset();
		this.pushUndo();
	}

	spinToCell(cell) {
		const group = this.cells.find(c => c == cell)?.groups[0];
		if (!group) return;
		const i = this.groups.indexOf(group) - 12;
		if (i < 0 || i > 6) return;
		return this.spinToFace(i);
	}

	spinToFace(i) {
		return this.spinTo([0, 3, 5, 2, 1, 4][i] / 6 + 0.05);
	}

	get rotation() {
		return this._rot;
	}
	set rotation(x) {
		this._rot = x;
		this.root.style.setProperty('--base-rotation', `${-x * 360}deg`);
		// quick hack to update the scrollbar which i cba doing with like an event emitter or something
		const w = $.scroller.clientWidth - (document.body.scrollWidth || window.scrollWidth);
		window.scrollTo(x * w / 3, 0);
	}

	spinTo(x) {
		let start, startX = this.rotation, self = this;
		while (x - startX > 0.5) x -= 1;
		while (x - startX < -0.5) x += 1;
		if (Math.abs(x - startX) < 0.1) return false;
		this.targetSpin = x;
		if (reducedMotion.active) {
			this.rotation = x;
			return true;
		}
		requestAnimationFrame(x => {
			start = x;
			nextFrame(start);
		});
		return true;
		function nextFrame(now) {
			if (self.targetSpin != x) return;
			const t = now - start;
			const f = t / 300;
			// this long string of gibberish is smoothstep:
			const p = f<0 ? 0 : f>1 ? 1 : (3*f**2 - 2*f**3), q = 1-p;
			self.rotation = startX * q + p * x;
			if (f < 1) requestAnimationFrame(nextFrame);
		}
	}

	fillInPencilMarks() {
		for (const cell of this.cells) cell.resetPencil(true);
		for (const cell of this.cells) cell.propagate();
	}

	reset() {
		for (const cell of this.cells) cell.reset();
	}

	setTool(tool) {
		for (const cell of this.cells) cell.setTool(tool);
	}
	setPencilValue(value) {
		for (const cell of this.cells) cell.setPencilValue(value);
	}

	pushUndo(cell) {
		const state = this.cells.map(cell => ({
			pen: cell.value,
			pencil: [...cell.pencil],
			highlight: [...cell.input.classList].filter(c => c.startsWith('highlight-')).map(c => c.substring(10))[0]
		}));
		this.undoStack.push({ cell, state });
		this.onUpdate?.({
			undoStack: this.undoStack,
			state,
			full: this.cells.every(cell => cell.value !== null),
			solved: this.cells.every(cell => cell.value == cell.answer)
		});
	}

	popUndo() {
		if (this.undoStack.length == 1) return;
		const { cell } = this.undoStack.pop();
		const { state } = this.undoStack[this.undoStack.length - 1];
		const spinning = cell && this.spinToCell(cell);
		setTimeout(() => {
			for (let i = 0; i < this.cells.length; ++i) {
				const cell = this.cells[i];
				const { pen, pencil, highlight } = state[i];
				cell.value = pen;
				for (let i = 0; i < 16; ++i) cell.setPencil(i, pencil[i]);
				if (!highlight) cell.clearHighlights();
				else cell.highlight(`highlight-${highlight}`);
			}
		}, spinning ? 300 : 0);
	}
}

function *bands(f, r, c) {
	yield f + 12;
	switch (f) {
		case 0: yield r; yield c + 4; return;
		case 1: yield r; yield 7 - c; return;
		case 2: yield r + 8; yield c + 4; return;
		case 3: yield r + 8; yield 7 - c; return;
		case 4: yield r; yield 11 - c; return;
		case 5: yield r; yield c + 8; return;
	}
}

class Group {
	constructor(type) {
		this.cells = [];
		this.className = `${type}-group`;
	}

	addCell(cell) {
		this.cells.push(cell);
		cell.addGroup(this);
	}

	highlight() {
		for (const cell of this.cells)
			cell.highlight(this.className);
	}

	unhighlight() {
		for (const cell of this.cells)
			cell.unhighlight(this.className);
	}
}

function nWhere(c) {
	const out = [];
	for (let i = 0; i < 16; ++i) if (c(i)) out.push(i);
	return out;
}

window.customElements.define('doku-cube', Cube);
