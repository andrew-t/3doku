import { shadowDom, el, classIf } from "./dom.js";
import style from "./radio-style.js";

export default class Radios extends HTMLElement {
	constructor() {
		super();
		shadowDom(this, `
			<style>${style}</style>
			<fieldset id="fieldset" class="${this.id}">
				<legend>${this.getAttribute("name")}</legend>
			</fieldset>
		`);
		this.radios = {};
		// here "name" is the name of the attribute, which is the value of the option
		// and "value" is the value of the attribute, which is the name of the option
		for (let { name, value } of this.attributes) {
			if (!name.startsWith('option-')) continue;
			const label = el(this.fieldset, 'label');
			name = name.substring(7);
			const radio = this.radios[name] = el(label, 'input');
			radio.setAttribute('type', 'radio');
			radio.setAttribute('name', this.getAttribute('name'));
			if (name == this.getAttribute('value')) {
				this._val = name;
				radio.setAttribute('checked', true);
			}
			el(label, 'span', value);
			label.classList.add(`${this.id}-${name}`);
			radio.addEventListener('change', e => {
				if (radio.checked) this.value = name;
			});
		}
	}

	get value() {
		return this._val;
	}

	set value(value) {
		if (value != null && !(value in this.radios)) throw new Error("Invalid value: " + value);
		this._val = value;
		for (const radio in this.radios) this.radios[radio].checked = radio == value;
		const event = new Event('change');
		event.value = value;
		this.dispatchEvent(event);
	}
}

window.customElements.define('radio-group', Radios);