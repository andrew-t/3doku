import { regularDom, el } from "../common/dom.js";
import './cell.js';
import { reducedMotion } from "../common/dark.js";
import Drag from "../common/drag.js";

const dragSpeed = -0.01;

class CubeDrag extends Drag {
	constructor(cube) {
		super();
		this.registerSource(cube);
		this.cube = cube;
	}
	start(d) {
		return true;
	}
	move(e) {
		let y = this.cube.rotation.y + e.dY * dragSpeed;
		if (y > 2) y = 2;
		if (y < 0) y = 0;
		this.cube.rotation = {
			x: this.cube.rotation.x + e.dX * dragSpeed,
			y: y
		};
	}
	end(d) { }
}

class Group {
	constructor(type) {
		this.cells = [];
		this.className = {
			face: "highlight-blue",
			"band-0": "highlight-red",
			"band-1": "highlight-yellow",
			"band-2": "highlight-green",
		}[type];
	}

	addCell(cell) {
		this.cells.push(cell);
		cell.addGroup(this);
	}
}

export default class Cube extends HTMLElement {
	connectedCallback() {

		regularDom(this, `
			<div class="cube-root" data-id="root"></div>
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
					cell.input.addEventListener('focus', e => this.lastFocusedCell = cell);
					for (const n of bands(f, r, c))
						this.groups[n].addCell(cell);
				}
			}
		}

		this.undoStack = [];

		this.lastFocusedCell = this.cells[16];
		let lastFocusedElement = document.activeElement;
		document.addEventListener('keydown', e => {
			if (document.activeElement == lastFocusedElement) return;
			lastFocusedElement = document.activeElement;
			if (document.activeElement != this) return;
			const cell = this.lastFocusedCell ?? this.cells[0];
			cell.input.focus();
			this.spinToCell(cell);
		});

		new CubeDrag(this);
		this.rotation = { x: -0.63, y: 0.72 };
	}

	cellAt(face, x, y) {
		return this.cells[(face << 4) + (y << 2) + x];
	}

	usePuzzle({ answers, moves, clues }) {
		for (let i = 0; i < 96; ++i) this.cells[i].answer = answers[i];
		for (const c of clues) this.cells[c].makeClue();
		this.solution = moves;
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
		switch (i) {
			case 0: return this.spinTo(1, 1);
			case 1: return this.spinTo(1.5, 1);
			case 2: return this.spinTo(1.5, 0);
			case 3: return this.spinTo(1.5, 2);
			case 4: return this.spinTo(1.25, 1);
			case 5: return this.spinTo(1.75, 1);
		}
	}

	get rotation() {
		return this._rot;
	}
	set rotation({ x, y }) {
		this._rot = { x, y };
		this.root.style.setProperty('--base-rotation-x', `${-x * 360}deg`);
		this.root.style.setProperty('--base-rotation-y', `${y * 90 - 90}deg`);
		// quick hack to update the scrollbar which i cba doing with like an event emitter or something
		// for the maths, see main.js
		// const w = $.scroller.clientWidth - window.innerWidth;
		// const h = $.scroller.clientHeight - window.innerHeight;
		// if ($.invertX.checked) x = 3 - x;
		// if ($.invertY.checked) y = 2 - y;
		// window.scrollTo(x * w / 3, y * h / 2);
	}

	spinTo(x, y) {
		let start, startX = this.rotation.x, startY = this.rotation.y, self = this;
		while (x - startX > 0.5) x -= 1;
		while (x - startX < -0.5) x += 1;
		if (Math.abs(x - startX) < 0.1 && Math.abs(y - startY) < 0.1) return false;
		this.targetSpin = { x, y };
		if (reducedMotion.active) {
			this.rotation = { x, y };
			return true;
		}
		requestAnimationFrame(x => {
			start = x;
			nextFrame(start);
		});
		return true;
		function nextFrame(now) {
			if (self.targetSpin.x != x || self.targetSpin.y != y) return;
			const t = now - start;
			const f = t / 300;
			// this long string of gibberish is smoothstep:
			const p = f<0 ? 0 : f>1 ? 1 : (3*f**2 - 2*f**3), q = 1-p;
			self.rotation = { x: startX * q + p * x, y: startY * q + p * y };
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
		this.emitUpdate();
	}

	emitUpdate() {
		const state = this.cells.map(cell => ({
			pen: cell.value,
			pencil: [...cell.pencil],
			highlight: [...cell.input.classList].filter(c => c.startsWith('highlight-')).map(c => c.substring(10))[0]
		}));
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

window.customElements.define('doku-cube', Cube);

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
