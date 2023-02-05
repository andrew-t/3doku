// the faces are 100vmin across
// there's a 2vmin gutter between each cell
// that's a 1vmin padding within each <td>
// plus a 1vmin padding around the whole table
// that leaves 90vmin for the cells
// which is to say, 22.5vmin each

export default `

:root {
	--base-rotation: 0deg;
}

#root {
	transform:
		scale(0.5)
		translateY(calc(50% - 50vmin));
	height: 100%;
	perspective: 500vmin;
	transform-style: preserve-3d;
}

.hidden { opacity: 0.2; }

.face {
	backface-visibility: hidden;
	position: absolute;
	top: 0; left: 0;
	padding: 1vmin;
	width: 100vmin; height: 100vmin;
	border: 0px black solid;
	border-spacing: 0;
}

.face td {
	padding: 0;
	width: 24.5vmin;
	min-width: 24.5vmin;
	height: 24.5vmin;
	font-size: 20vmin;
	overflow: hidden;
}

.f0 {
	background: #0c0;
	transform:
		rotateY(var(--base-rotation))
		rotate3d(0.7, 0, 0.7, -54.74deg)
		translate3d(0, 0, 50vmin);
}
.f1 {
	background: #c00;
	transform:
		rotateY(var(--base-rotation))
		rotate3d(0.7, 0, 0.7, -54.74deg)
		translate3d(0, 0, -50vmin)
		rotateY(180deg);
}
.f2 {
	background: #fc0;
	transform:
		rotateY(var(--base-rotation))
		rotate3d(0.7, 0, 0.7, -54.74deg)
		translate3d(0, -50vmin, 0)
		rotateX(90deg);
}
.f3 {
	background: #80c;
	transform:
		rotateY(var(--base-rotation))
		rotate3d(0.7, 0, 0.7, -54.74deg)
		translate3d(0, 50vmin, 0)
		rotateX(-90deg)
		rotateZ(180deg);
}
.f4 {
	background: #00c;
	transform:
		rotateY(var(--base-rotation))
		rotate3d(0.7, 0, 0.7, -54.74deg)
		translate3d(50vmin, 0, 0)
		rotateY(90deg);
}
.f5 {
	background: #0cc;
	transform:
		rotateY(var(--base-rotation))
		rotate3d(0.7, 0, 0.7, -54.74deg)
		translate3d(-50vmin, 0, 0)
		rotateY(-90deg);
}

`;
