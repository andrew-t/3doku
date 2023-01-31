import { classIf } from "./dom.js";
import './cube.js';
import './radios.js';

const cube = document.getElementById('cube');

cube.loadPuzzle('generation/puzzle.json')
	.then(console.log, console.error);

document.addEventListener('DOMContentLoaded', e => {
	window.addEventListener('scroll', e => spinCube());
	spinCube(0.5);
	document.getElementById('fill-in-pencil')
		.addEventListener('click', e => cube.fillInPencilMarks());
	document.getElementById('reset')
		.addEventListener('click', e => {
			if (confirm("Remove all your working out so far?")) cube.reset();
		});
	document.getElementById('tool')
		.addEventListener('change', e => {
			classIf(document.getElementById('pencil-value'), 'hidden', e.value != 'pencil');
			classIf(document.getElementById('highlight-colour'), 'hidden', e.value != 'highlight');
			classIf(document.getElementById('buttons'), 'hidden', e.value == 'pencil' || e.value == 'highlight');
			cube.setTool(e.value);
		});
	// TODO: when the pencil tool is selected (or when you change the pencil value) highlight all cells that COULD be that number
	fixSize();
})

function spinCube(x) {
	const w = document.getElementById('scroller').clientWidth -
		(document.body.scrollWidth || window.scrollWidth);
	if (x === undefined) x = document.scrollingElement.scrollLeft * 3 / w;
	else document.scrollingElement.scrollLeft = window.scrollX = x * w / 3;
	if (x > 2) spinCube(x - 1);
	else if (x < 1) spinCube(x + 1);
	else cube.rotation = x;
}

window.addEventListener('resize', debounce(fixSize));

function debounce(fn, t = 300) {
	let h;
	return () => {
		if (h) clearTimeout(h);
		h = setTimeout(fn, t);
	};
}

function fixSize() {
	// ok so what we have to do is make sure the cube render fits in the box
	// it's rendered at 100vmin regardless of the box size so we just have to fit that in
	const renderSize = Math.min(window.innerWidth, window.innerHeight);
	const cubeEl = document.getElementById('cube');
	const idealSize = Math.min(cube.clientWidth, cube.clientHeight);
	cube.style.transform = `
		scale(${ idealSize / renderSize })
		translateY(${(cube.clientHeight - idealSize) / 2}px)
	`;
}
