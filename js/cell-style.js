// per cube-style.js, this object will be 24.5vmin altogether
// 1vmin of which on each side is gutter
// leaving 22.5vmin altogether

export default `

.root {
	position: relative;
	width: 24.5vmin;
	height: 24.5vmin;
}

input, #pencilMarkDiv {
	position: absolute;
	left: 1vmin; top: 1vmin;
	width: 22.5vmin;
	height: 22.5vmin;
	margin: 0;
	padding: 0;
}

input {
	--bg: white;
	font-size: 16vmin;
	font-family: sans-serif;
	text-align: center;
	background: var(--bg);
	border-radius: 3vmin;
	border: none;
	transition:
		box-shadow 300ms,
		background 300ms;
	box-shadow:
		0 0 0 0.5vmin var(--bg) inset,
		0 0 0 0.5vmin #48f inset;
}

input[readonly=true] {
	color: blue;
	box-shadow:
		0 0 0 0.5vmin var(--bg) inset,
		0 0 0 1.5vmin black inset;
}

input.face-group { --bg: #cdf; }
input.band-0-group { --bg: #fcc; }
input.band-1-group { --bg: #ffc; }
input.band-0-group.band-1-group { --bg: #fec; }
input.band-2-group { --bg: #cfd; }
input.band-0-group.band-2-group { --bg: #ffc; }
input.band-1-group.band-2-group { --bg: #dfe; }
input.highlight-red { --bg: #fcc !important; }
input.highlight-blue { --bg: #ccf !important; }
input.highlight-green { --bg: #cfc !important; }
input.highlight-purple { --bg: #ecf !important; }
input.highlight-orange { --bg: #fdb !important; }
input.highlight-yellow { --bg: #ffc !important; }
input.highlight-teal { --bg: #cdf !important; }
input:invalid {
	--bg: #ff0 !important; color: #f00;
	box-shadow:
		0 0 0 0.5vmin var(--bg) inset,
		0 0 0 1.5vmin red inset;
}

input:focus {
	outline: none;
	box-shadow:
		0 0 0 0.5vmin var(--bg) inset,
		0 0 0 1.5vmin #48f inset
		!important;
}

#pencilMarkDiv {
	display: grid;
	grid-template-rows: repeat(4, 1fr);
	grid-template-columns: repeat(4, 1fr);
	font-size: 4vmin;
	pointer-events: none;
	transition: opacity 300ms;
	font-family: sans-serif;
	text-align: center;
	opacity: 0.5;
}

#pencilMarkDiv div {
	transition: opacity 300ms;
}

.hidden {
	opacity: 0 !important;
}

`;
