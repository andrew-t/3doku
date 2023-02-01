import $ from '../util/dom.js';
import storage from "./data.js";
import { initDarkMode, initReducedMotion, ON, OFF, SYSTEM } from "../util/dark.js";

export const darkMode = initDarkMode(storage.dark ?? SYSTEM);
export const reducedMotion = initReducedMotion(storage.reducedMotion ?? SYSTEM);

switch (storage.dark) {
	case ON: $.darkOn.checked = true; break;
	case OFF: $.darkOff.checked = true; break;
	default: $.darkSystem.checked = true; break;
}

switch (storage.reducedMotion) {
	case ON: $.reducedMotionOn.checked = true; break;
	case OFF: $.reducedMotionOff.checked = true; break;
	default: $.reducedMotionSystem.checked = true; break;
}

$.darkOn.addEventListener('click', e => {
	storage.dark = ON;
	darkMode.setOn();
});

$.darkOff.addEventListener('click', e => {
	storage.dark = OFF;
	darkMode.setOff();
});

$.darkSystem.addEventListener('click', e => {
	storage.dark = SYSTEM;
	darkMode.setSystem();
});

$.reducedMotionOn.addEventListener('click', e => {
	storage.reducedMotion = ON;
	reducedMotion.setOn();
});

$.reducedMotionOff.addEventListener('click', e => {
	storage.reducedMotion = OFF;
	reducedMotion.setOff();
});

$.reducedMotionSystem.addEventListener('click', e => {
	storage.reducedMotion = SYSTEM;
	reducedMotion.setSystem();
});
