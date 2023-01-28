import './cube.js';
import './radios.js';

const cube = document.getElementById('cube');

document.addEventListener('DOMContentLoaded', e => {
	window.addEventListener('scroll', e => spinCube());
	spinCube(0.5);
	document.getElementById('fill-in-pencil')
		.addEventListener('click', e => cube.fillInPencilMarks());
	document.getElementById('reset')
		.addEventListener('click', e => cube.resetNonClueCells());
	document.getElementById('tool')
		.addEventListener('change', e => cube.setTool(e.value));
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