export function el(parent, q, text) {
	const [tag, ...classes] = q.split('.');
	const el = document.createElement(tag);
	for (const c of classes) el.classList.add(c);
	parent?.appendChild(el);
	if (text) el.appendChild(document.createTextNode(text));
	return el;
}

export function shadowDom(host, template) {
	host.attachShadow(({ mode: 'open' }));
	host.shadowRoot.innerHTML = template;
	for (const element of [ ...host.shadowRoot.querySelectorAll('[id]') ])
		host[element.id] = element;
}

export function classIf(el, cl, cond) {
	if (cond) el.classList.add(cl);
	else el.classList.remove(cl);
}

export function multiple(template, count) {
	let dom = '';
	for (let i = 0; i < count; ++i)
		dom += template;
	return dom;
}

export function map(array, toTemplate) {
	return [ ...array ].map(toTemplate).join('');
}

export function importChildren(host, node) {
	for (const child of host.childNodes)
		node.appendChild(child);
}

export function waitForClick(button) {
	return new Promise(resolve => {
		button.disabled = false;
		const listener = () => {
			button.disabled = true;
			button.removeEventListener('click', listener);
			resolve();
		};
		button.addEventListener('click', listener);
	});
}
