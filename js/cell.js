import { shadowDom, el, classIf } from "../common/dom.js";
import $, { styles } from "../util/dom.js";
import getNewCoords from "./cell-coords.js";

export default class DokuCell extends HTMLElement {
	constructor() {
		super();
		this.groups = [];
		this.pencil = [];
		this.tool = 'pen';
		this.answer = null;

		shadowDom(this, `
			${styles}
			<div class="cell-root">
				<input id="input" inputmode="numeric" tabindex="-1">
				<div id="pencilMarkDiv"></div>
			</div>
		`);

		this.pencilMarks = [];
		for (let x = 0; x < 16; ++x)
			this.pencilMarks[x] = el(this.pencilMarkDiv, 'div', x + 1);

		this.input.addEventListener('focus', e => {
			if (this.tool == 'pen') {
				this.pencilMarkDiv.classList.add('erased');
				this.input.setSelectionRange(0, this.input.value.length)
				for (const group of this.groups)
					group.highlight();
			}
			// Handy debugging
			console.log("Focussed cell:", this.coords);
		});

		this.input.addEventListener('blur', e => {
			for (const group of this.groups)
				group.unhighlight();
			if (this.tool == 'pen') {
				if (!/^([1-9]|1[0-6])?$/.test(this.input.value)) {
					this.input.value = this._value == null ? '' : (this._value + 1);
					return;
				}
				const newValue = this.input.value ? this.input.value - 1 : null;
				if (newValue !== this.value) {
					this.value = newValue;
					this.cube.pushUndo(this);
				}
			}
			classIf(this.pencilMarkDiv, 'erased', this.value != null);
			if ($.autopencil.checked) this.propagate();
		});

		this.input.addEventListener('click', e => {
			switch (this.tool) {
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
			this.input.value = '';
			this.pencilMarkDiv.classList.remove('erased');
			return;
		}
		this.pencilMarkDiv.classList.add('erased');
		if (typeof n != 'number' || n < 0 || n > 15 || n != ~~n)
			throw new Error('Invalid value: ' + n);
		this.input.value = n + 1;
		for (let i = 0; i < 16; ++i)
			this.setPencil(i, i == n);
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
		classIf(this.input, 'highlight-pencil', this.tool == 'pencil' && this.pencil[this._pencilValue]);
	}

	_pencilValue = 0;
	setTool(tool) {
		switch (tool) {
			case 'pen':
				this.setPencilValue(null);
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
	}
	setPencilValue(value) {
		if (value === null) {
			this.input.classList.remove('highlight-pencil');
			return;
		}
		this._pencilValue = value;
		classIf(this.input, 'highlight-pencil', this.pencil[this._pencilValue]);
	}
}

window.customElements.define('doku-cell', DokuCell);
