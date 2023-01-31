import { shadowDom, el, classIf } from "./dom.js";
import './cell.js';
import style from './cube-style.js';

export default class Cube extends HTMLElement {
	constructor() {
		super();

		shadowDom(this, `
			<style>${style}</style>
			<div id="root"></div>
		`);

		this.groups = [];
		for (let i = 0; i < 12; ++i)
			this.groups.push(new Group(`band-${~~(i / 4)}`));
		for (let i = 0; i < 6; ++i)
			this.groups.push(new Group(`face`));

		this.faces = [];
		this.cells = [];
		const faceEls = [];
		for (let f = 0; f < 6; ++f) {
			const table = el(null, `table.face.f${f}`);
			// Append them in this silly order so the tab order is reasonable.
			// Ideally I'd rewrite the code so they were natively in this order,
			// but that would be an absurd waste of my time.
			faceEls[[5,2,4,1,0,3][f]] = table;
			const tbody = el(this.faces[f] = table, 'tbody');
			for (let r = 0; r < 4; ++r) {
				const tr = el(tbody, 'tr');
				for (let c = 0; c < 4; ++c) {
					const cell = el(el(tr, 'td'), 'doku-cell');
					this.cells.push(cell);
					cell.cube = this;
					for (const n of bands(f, r, c))
						this.groups[n].addCell(cell);
				}
			}
		}
		for (const el of faceEls) this.root.appendChild(el);

		this.root.addEventListener('keyup', e => {
			if (e.key == 'Tab') this.spinToCell(this.shadowRoot.activeElement);
		});

		this.undoStack = [];
	}

	async loadPuzzle(url) {
		const resp = await fetch(url);
		const json = await resp.text();
		const { answers, moves, clues } = JSON.parse(json);
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
		this.spinToFace(i);
	}

	spinToFace(i) {
		this.spinTo([.03, .41, .88, .40, .20, .68][i]);
	}

	get rotation() {
		return this._rot;
	}
	set rotation(x) {
		this._rot = x;
		this.root.style.setProperty('--base-rotation', `${-x * 360}deg`);
	}

	spinTo(x) {
		let start, startX = this.rotation, self = this;
		while (x - startX > 0.5) x -= 1;
		while (x - startX < -0.5) x += 1;
		if (Math.abs(x - startX) < 0.1) return;
		requestAnimationFrame(x => {
			start = x;
			f(start);
		});
		function f(now) {
			const t = now - start;
			const p = t / 300, q = 1 - p;
			if (p >= 1) return self.rotation = x;
			// todo: use a nicer easing function
			self.rotation = startX * q + p * x;
			// quick hack to update the scrollbar which i cba doing with like an event emitter or something
			const w = document.getElementById('scroller').clientWidth -
				(document.body.scrollWidth || window.scrollWidth);
			window.scrollTo(x * w / 3, 0);
			requestAnimationFrame(f);
		}
	}

	findMove() {
		// this cell can only be a 5:
		for (const cell of this.cells) {
			const candidates = nWhere(n => cell.pencil[n]);
			if (candidates.length == 1 && cell.value == null)
				return { cell, value: candidates[0] };
		}
		// the 5 in this group has to be here:
		for (const group of this.groups)
			for (let n = 0; n < 16; ++n) {
				const candidates = group.cells.filter(c => c.pencil[n]);
				if (candidates.length == 1 && candidates[0].value == null)
					return { cell: candidates[0], value: n, group };
			}
		// TODO: cleverer things
		// give up
		return null;
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

	pushUndo(cell) {
		this.undoStack.push({
			cell,
			state: this.cells.map(cell => ({
				pen: cell.value,
				pencil: [...cell.pencil],
				highlight: [...cell.input.classList].filter(c => c.startsWith('highlight-')).map(c => c.substring(10))[0]
			}))
		});
	}

	popUndo() {
		if (this.undoStack.length == 1) return;
		this.undoStack.pop();
		const { cell, state } = this.undoStack[this.undoStack.length - 1];
		for (let i = 0; i < this.cells.length; ++i) {
			const cell = this.cells[i];
			const { pen, pencil, highlight } = state[i];
			cell.value = pen;
			for (let i = 0; i < 16; ++i) cell.setPencil(i, pencil[i]);
			if (!highlight) cell.clearHighlights();
			else cell.highlight(`highlight-${highlight}`);
		}
		if (cell) this.spinToCell(cell);
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

function arrRand(arr) {
	return arr[~~(Math.random() * arr.length)];
}

function nWhere(c) {
	const out = [];
	for (let i = 0; i < 16; ++i) if (c(i)) out.push(i);
	return out;
}

window.customElements.define('doku-cube', Cube);
