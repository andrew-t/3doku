const stack = [ ...document.querySelectorAll('dialog[open]') ].map(el => el.id);

export function openModal(id) {
	hideCurrent();
	for (let i = stack.length - 2; i >= 0; --i)
		if (stack[i] == id) {
			hideCurrent();
			stack.length = i + 1;
			showCurrent();
			return;
		}
	stack.push(id);
	showCurrent();
}

export function currentModal() {
	return stack.length
		? document.getElementById(stack[stack.length - 1])
		: null;
}

export function toggleModal(id) {
	if (stack[stack.length - 1] == id) closeModal();
	else openModal(id);
}

export function closeModal() {
	hideCurrent();
	stack.pop();
	showCurrent();
}

export function clearModals() {
	hideCurrent();
	stack.length = 0;
}

function hideCurrent() {
	currentModal()?.removeAttribute?.('open');
	if (stack.length < 2) document.getElementById('scroller').classList.remove('hidden');
}

function showCurrent() {
	currentModal()?.setAttribute('open', true);
	scrollToTop(currentModal());
	if (stack.length > 0) document.getElementById('scroller').classList.add('hidden');
}

function scrollToTop(el) {
	if (!el) return;
	el.scrollTop = 0;
	el.scrollLeft = 0;
	for (const c of el.children) scrollToTop(c);
}
