import { regularDom, el, classIf } from "../common/dom.js";
import $ from "../util/dom.js";
import getNewCoords from "./cell-coords.js";

// This forces Safari to render the cells on the GPU, and prevents them from animating. This stops them flickering randomly between their current state, their previous state, and complete non-existence like they're fucking Billy Pilgrim or something. Safari's dogshit framerate alas cannot be fixed with a line of CSS.
if (/apple/i.test(navigator.vendor ?? ""))
	el(document.body, 'style', `
		.cell-root { transform: translate3d(0, 0, 0); }
		.cell-root, .cell-root * { transition: none !important; }
	`);

export default class DokuCell extends HTMLElement {
	connectedCallback() {
		this.groups = [];
		this.pencil = [];
		this.tool = 'none';
		this.answer = null;

		regularDom(this, `
			<div class="cell-root">
				<button data-id="input" inputmode="numeric" tabindex="-1"></button>
				<div data-id="pencilMarkDiv" class="pencilMarkDiv"></div>
			</div>
		`);

		this.pencilMarks = [];
		for (let x = 0; x < 16; ++x)
			this.pencilMarks[x] = el(this.pencilMarkDiv, 'div', x + 1);

		// Handy debugging
		this.input.addEventListener('focus', e => console.log("Focussed cell:", this.coords));

		this.input.addEventListener('click', e => {
			switch (this.tool) {
				case 'pen':
					if (this.isClue) break;
					if (this.value === this._pencilValue) this.value = null;
					else {
						this.value = this._pencilValue;
						if ($.autopencil.checked) this.propagate();
					}
					this.updatePencilHighlight();
					this.cube.pushUndo(this);
					break;
				case 'pencil':
					if (this.value != null) break;
					this.setPencil(this._pencilValue, !this.pencil[this._pencilValue]);
					this.cube.pushUndo(this);
					break;
				case 'highlight':
					const colour = $.highlightColour.value;
					if (colour == 'none') {
						this.clearHighlights();
						this.cube.pushUndo(this);
						return;
					}
					if (colour == 'groups') {
						for (const cell of this.cube.cells) cell.clearHighlights();
						for (const group of this.groups)
							for (const cell of group.cells) {
								cell.clearHighlights();
								cell.highlight(group.className);
							}
						this.clearHighlights();
						this.highlight("highlight-yellow");
						return;
					}
					const className = `highlight-${colour}`;
					if (this.input.classList.contains(className))
						this.input.classList.remove(className);
					else {
						for (const className of this.input.classList)
							if (className.startsWith('highlight-'))
								this.input.classList.remove(className);
						this.input.classList.add(className);
					}
					this.cube.pushUndo(this);
					break;
			}
		});

		this.input.addEventListener('keydown', e => {
			const newCoords = getNewCoords(e, this.coords);
			if (!newCoords) return;
			e.preventDefault();
			const cell = this.cube.cellAt(newCoords.face, newCoords.x, newCoords.y);
			cell.input.focus();
			this.cube.spinToCell(cell);
		});

		$.showErrors.addEventListener('change', () => this.updateErrorFlag());

		this.reset();
	}

	get coords() {
		// Handy debugging
		const id = this.cube.cells.indexOf(this);
		return {
			id,
			face: ~~(id / 16),
			x: id % 4,
			y: ~~(id / 4) % 4
		};
	}

	updateErrorFlag() {
		this.input.setCustomValidity(
			$.showErrors.checked &&
			this.answer !== null &&
			this.value !== null &&
			this.value !== this.answer
				? 'This answer is incorrect'
				: '');
	}

	reset() {
		if (!this.isClue) {
			this.value = null;
			this.resetPencil(false);
		}
		this.clearHighlights();
	}

	resetPencil(value = true) {
		for (let i = 0; i < 16; ++i) this.setPencil(i, value);
	}

	get value() { return this._value; }
	set value(n) {
		this._value = n;
		this.updateErrorFlag();
		if (n == null) {
			this.input.innerText = '';
			this.pencilMarkDiv.classList.remove('erased');
			return;
		}
		this.pencilMarkDiv.classList.add('erased');
		if (typeof n != 'number' || n < 0 || n > 15 || n != ~~n) {
			throw new Error('Invalid value: ' + n);
		}
		this.input.innerText = n + 1;
		for (let i = 0; i < 16; ++i)
			this.setPencil(i, i == n);
		this.cube?.updatePencilHighlight();
	}

	makeClue() {
		this.input.setAttribute('readonly', true);
		this.value = this.answer;
		for (let i = 0; i < 16; ++i)
			this.setPencil(i, i == this.answer);
	}
	get isClue() { return this.input.hasAttribute('readonly'); }

	propagate() {
		if (this.value === null) return;
		for (const group of this.groups)
			for (const cell of group.cells)
				cell.setPencil(this.value, cell == this);
	}

	highlight(className) {
		this.input.classList.add(className);
	}

	unhighlight(className) {
		this.input.classList.remove(className);
	}

	clearHighlights() {
		for (const c of [...this.input.classList]) this.input.classList.remove(c);
	}

	addGroup(group) {
		this.groups.push(group);
	}

	setPencil(n, allowed) {
		if (this.value !== null) allowed = this.value == n;
		this.pencil[n] = allowed;
		classIf(this.pencilMarks[n], 'erased', !allowed);
		this.cube?.updatePencilHighlight();
	}

	_pencilValue = 0;
	setTool(tool) {
		switch (tool) {
			case 'pen':
				this.setPencilValue(this._pencilValue);
				this.input.setAttribute('type', 'text');
				break;
			case 'pencil': 
				this.setPencilValue(this._pencilValue);
				this.input.setAttribute('type', 'button');
				break;
			case 'highlight': case 'none':
				this.setPencilValue(null);
				this.input.setAttribute('type', 'button');
				break;
			default: throw new Error("Invalid tool: " + tool);
		}
		this.tool = tool;
		this.updatePencilHighlight();
	}
	setPencilValue(value) {
		if (value !== null) {
			if (typeof value == 'string' && /^\d+$/.test(value)) value = parseInt(value, 10);
			this._pencilValue = value;
		}
		this.cube.updatePencilHighlight();
	}
	updatePencilHighlight() {
		const showPencilValues =
			this.tool.startsWith('pen') &&
			$.pencilHighlighting.checked &&
			(
				this.cube.cells.some(c => c.value === null && c.pencil[this._pencilValue]) ||
				this.cube.cells.reduce((a, c) => c.value === this._pencilValue ? a + 1 : a, 0) == 6
			);
		classIf(this.input, 'showing-pencil-value', showPencilValues);
		classIf(this.input, 'current-pencil-value',
			showPencilValues &&
			(this.value === null
				? this.pencil[this._pencilValue]
				: this.value == this._pencilValue)
		);
	}
}

window.customElements.define('doku-cell', DokuCell);
