export default `

fieldset {
	border: none;
	padding: 0;
	margin: 0;
}
legend {
	font-size: 0;
}

label {
	display: inline-block;
	width: 12em;
	height: 12em;
	position: relative;
	margin: 1em;
	padding: 0;
}

label input {
	appearance: none;
	width: 100%;
	height: 100%;
	background: #bbb;
	background-size: 60%;
	background-position: 50% 50%;
	background-repeat: no-repeat;
	margin: 0;
	padding: 0;
	border-radius: 1em;
}

label input:checked {
	background-color: #00f;
}

label span { color: #000; }
label input:checked + span { color: #fff; }

label.tool-pen input { background-image: url('assets/pen-nib-solid.svg'); }
label.tool-pencil input { background-image: url('assets/pencil-solid.svg'); }
label.tool-highlight input { background-image: url('assets/highlighter-solid.svg'); }
label.tool-none input { background-image: url('assets/hand-solid.svg'); }
label.tool-pen input:checked, label.tool-pen input:disabled { background-image: url('assets/white/pen-nib-solid.svg'); }
label.tool-pencil input:checked, label.tool-pencil input:disabled { background-image: url('assets/white/pencil-solid.svg'); }
label.tool-highlight input:checked, label.tool-highlight input:disabled { background-image: url('assets/white/highlighter-solid.svg'); }
label.tool-none input:checked, label.tool-none input:disabled { background-image: url('assets/white/hand-solid.svg'); }

fieldset span {
	font-size: 0;
}
fieldset.pencil-value span {
	z-index: 1;
	font-size: 6em;
	position: absolute;
	top: 0;
	left: 0;
	width: 2em;
	height: 2em;
	line-height: 2em;
	text-align: center;
}

fieldset.highlight-colour label {
	width: 26em;
}
fieldset.highlight-colour input {
	transition: box-shadow 500ms;
}
fieldset.highlight-colour input:checked {
	box-shadow: 0 0 0 1em #000 inset;
}
label.highlight-colour-red input { background: #f00; }
label.highlight-colour-yellow input { background: #ff0; }
label.highlight-colour-green input { background: #0f0; }
label.highlight-colour-blue input { background: #04f; }
label.highlight-colour-teal input { background: #0cf; }
label.highlight-colour-orange input { background: #fc0; }
label.highlight-colour-purple input { background: #c0f; }
label.highlight-colour-none input { background: #fff; box-shadow: 0 0 0 .2em #000 inset }

`;
