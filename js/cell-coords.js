const bandDirections = {
	//  Green:   Red:     Yellow:  Purple:  Blue:    Teal:
	r: ["Right", "Right", null,    null,    "Right", "Right"],
	f: ["Left",  "Left",  null,    null,    "Left",  "Left" ],
	g: [null,    null,    "Left",  "Right", "Down",  "Up"   ],
	t: [null,    null,    "Right", "Left",  "Up",    "Down" ],
	y: ["Down",  "Up",    "Up",    "Up",    null,    null   ],
	h: ["Up",    "Down",  "Down",  "Down",  null,    null   ],
};

const opposites = {
	ArrowLeft:  "ArrowRight",
	ArrowRight: "ArrowLeft",
	ArrowUp:    "ArrowDown",
	ArrowDown:  "ArrowUp"
};

export default function getNewCoords(e, { face, x, y }) {
	let dir = e.key;
	if (face == 2) dir = opposites[dir] ?? dir;
	switch (dir) {
		case "ArrowLeft":
			if (x > 0) return { face, x: x - 1, y };
			switch (face) {
				case 0: return { face: 5, x: 3, y };
				case 1: return { face: 4, x: 3, y };
				case 2: return { face: 5, x: y, y: 0 };
				case 3: return { face: 4, x: 3 - y, y: 3 };
				case 4: return { face: 0, x: 3, y };
				case 5: return { face: 1, x: 3, y };
			}
			return;
		case "ArrowRight":
			if (x < 3) return { face, x: x + 1, y };
			switch (face) {
				case 0: return { face: 4, x: 0, y };
				case 1: return { face: 5, x: 0, y };
				case 2: return { face: 4, x: 3 - y, y: 0 };
				case 3: return { face: 5, x: y, y: 3 };
				case 4: return { face: 1, x: 0, y };
				case 5: return { face: 0, x: 0, y };
			}
			return;
		case "ArrowUp":
			if (y > 0) return { face, x, y: y - 1 };
			switch (face) {
				case 0: return { face: 2, x, y: 3 };
				case 1: return { face: 2, x: 3 - x, y: 0 };
				case 2: return { face: 1, x: 3 - x, y: 0 };
				case 3: return { face: 1, x, y: 3 };
				case 4: return { face: 2, x: 3, y: 3 - x };
				case 5: return { face: 2, x: 0, y: x };
			}
			return;
		case "ArrowDown":
			if (y < 3) return { face, x, y: y + 1 };
			switch (face) {
				case 0: return { face: 3, x: 3 - x, y: 3 };
				case 1: return { face: 3, x, y: 0 };
				case 2: return { face: 0, x, y: 0 };
				case 3: return { face: 0, x: 3 - x, y: 3 };
				case 4: return { face: 3, x: 0, y: 3 - x };
				case 5: return { face: 3, x: 3, y: x };
			}
			return;
		case "Tab":
			if (!e.shiftKey) {
				$.tool.focus();
				e.preventDefault();
				return;
			}
			// focus the the cube, that way the tab will take us to the control before the cube.
			this.cube.focus();
			return;
		default:
			const alias = bandDirections[e.key];
			if (alias) return getNewCoords({ key: `Arrow${alias[face]}` }, { face, x, y });
			console.log("Unrecognised key code", e.key, e);
			return;
	}
}
