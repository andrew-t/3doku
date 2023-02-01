export const ON = 'ON';
export const OFF = 'OFF';
export const SYSTEM = 'SYS';

export function initDarkMode(mode = SYSTEM) {
	return init('(prefers-color-scheme: dark)', 'dark-mode', mode); 
}

export function initReducedMotion(mode = SYSTEM) {
	return init('(prefers-reduced-motion: reduce)', 'reduced-motion', mode); 
}

function init(queryString, bodyClass, mode) {
	const query = window.matchMedia(queryString);
	const listeners = { enable: [], disable: [], change: [] };

	const returnedObject = {
		active: mode == ON ? true : (mode == OFF ? false : query.matches),
		mode,
		addEventListener(e, cb) {
			listeners[e].push(cb);
		},
		removeEventListener(e, cb) {
			listeners[e] = listeners[e].filter(x => x != cb);
		},
		setOn() {
			returnedObject.mode = ON;
			if (returnedObject.active) return;
			returnedObject.active = true;
			update();
		},
		setOff() {
			returnedObject.mode = OFF;
			if (!returnedObject.active) return;
			returnedObject.active = false;
			update();
		},
		setSystem() {
			returnedObject.mode = SYSTEM;
			if (returnedObject.active == query.matches) return;
			returnedObject.active = query.matches;
			update();
		}
	};

	setBodyClass();

	query.addEventListener('change', event => {
		if (returnedObject.mode != SYSTEM) return;
		returnedObject.active = event.matches;
		update();
	});

	return returnedObject;

	function update() {
		setBodyClass();
		if (returnedObject.active) for (const cb of listeners.enable) cb();
		else for (const cb of listeners.disable) cb();
		for (const cb of listeners.change) cb(returnedObject.active);
	}

	function setBodyClass() {
		if (returnedObject.active) document.body.classList.add(bodyClass);
		else document.body.classList.remove(bodyClass);
	}
}
