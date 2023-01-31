import { shadowDom, el, classIf } from "./dom.js";
import style from "./cell-style.js";

export default class DokuCell extends HTMLElement {
	constructor() {
		super();
		this.groups = [];
		this.pencil = [];
		this.tool = 'pen';
		this.answer = null;

		shadowDom(this, `
			<style>${style}</style>
			<div class="root">
				<input id="input">
				<div id="pencilMarkDiv"></div>
			</div>
		`);

		this.pencilMarks = [];
		for (let x = 0; x < 16; ++x)
			this.pencilMarks[x] = el(this.pencilMarkDiv, 'div', x + 1);

		this.input.addEventListener('focus', e => {
			if (this.tool == 'pen') {
				this.pencilMarkDiv.classList.add('hidden');
				for (const group of this.groups)
					group.highlight();
			}
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
			classIf(this.pencilMarkDiv, 'hidden', this.value != null);
			if (document.getElementById('autopencil').checked) this.propagate();
		});

		this.input.addEventListener('click', e => {
			switch (this.tool) {
				case 'pencil':
					const p = document.getElementById('pencil-value').value;
					this.setPencil(p, !this.pencil[p]);
					this.cube.pushUndo(this);
					break;
				case 'highlight':
					const colour = document.getElementById('highlight-colour').value;
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

		document.getElementById('show-errors')
			.addEventListener('change', () => this.updateErrorFlag());

		this.reset();
	}

	updateErrorFlag() {
		this.input.setCustomValidity(
			document.getElementById('show-errors').checked &&
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
			this.pencilMarkDiv.classList.remove('hidden');
			return;
		}
		this.pencilMarkDiv.classList.add('hidden');
		if (typeof n != 'number' || n < 0 || n > 15 || n != ~~n)
			throw new Error('Invalid value: ' + n);
		this.input.value = n + 1;
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
		this.pencil[n] = allowed;
		classIf(this.pencilMarks[n], 'hidden', !allowed);
	}

	setTool(tool) {
		switch (tool) {
			case 'pen': this.input.setAttribute('type', 'text'); break;
			case 'pencil': case 'highlight': case 'none':
				this.input.setAttribute('type', 'button');
				break;
			default: throw new Error("Invalid tool: " + tool);
		}
		this.tool = tool;
	}
}

window.customElements.define('doku-cell', DokuCell);
