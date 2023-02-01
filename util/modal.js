import $ from "./dom.js";
import { classIf } from "../common/dom.js";

const stack = [ ...document.querySelectorAll('dialog[open]') ].map(el => el.id);

export function openModal(id) {
	hideCurrent();
	$.dialogOverlay.classList.remove('hidden');
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
	classIf($.dialogOverlay, 'hidden', stack.length < 1);
}

export function clearModals() {
	hideCurrent();
	stack.length = 0;
	$.dialogOverlay.classList.add('hidden');
}

function hideCurrent() {
	currentModal()?.removeAttribute?.('open');
}

function showCurrent() {
	currentModal()?.setAttribute('open', true);
	scrollToTop(currentModal());
}

function scrollToTop(el) {
	if (!el) return;
	el.scrollTop = 0;
	el.scrollLeft = 0;
	for (const c of el.children) scrollToTop(c);
}

export function confirm(message, okText = 'OK', cancelText = 'Cancel') {
	return new Promise((resolve) => {
		$.confirmBlurb.innerHTML = message;
		$.confirmOk.innerHTML = okText;
		$.confirmCancel.innerHTML = cancelText;
		function onOk() { resolve(true); clearCallbacks(); }
		function onCancel() { resolve(false); clearCallbacks(); }
		function clearCallbacks() {
			closeModal();
			$.confirmOk.removeEventListener('click', onOk);
			$.confirmCancel.removeEventListener('click', onCancel);
		}
		$.confirmOk.addEventListener('click', onOk);
		$.confirmCancel.addEventListener('click', onCancel);
		openModal('confirm');
	});
}
