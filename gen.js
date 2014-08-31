var sol = null; var pencil = null; var pen = null; var clues = null;
var attempts = 0;
function newCube() {
	attempts = 0;
	clearCube();
	guessClue(15);
	while (true) {
		var s = 1;
		while (s == 1) { s = solve(false); }
		if (s == 0) guessClue();
		else if (s == 2) {
			for (var i = 0; i < 96; ++i) {
				pen[i] = clues[i];
				if (clues[i] > -1) for (var j = 0; j < 16; ++j)
					pencil[i][j] = (j == clues[i]);
				else for (var j = 0; j < 16; ++j) pencil[i][j] = true;
			}
			drawCube();
			solved = false;
			return;
		} else {
			clearCube();
			guessClue(15);
		}
	}
}
function clearCube() {
	console.log("attempt " + ++ attempts);
	sol = new Array();
	pencil = new Array();
	pen = new Array();
	clues = new Array();
	for (var i = 0; i < 96; ++i) {
		sol[i] = -1;
		pencil[i] = new Array();
		for (var j = 0; j < 16; ++j) pencil[i][j] = true;
		pen[i] = -1;
		clues[i] = -1;
	}
}
var guesses = 0;
function guessClue(n) {
	if (n == null) n = 1;
	for (var m = 0; m < n; ++m) {
		console.log("  clue " + ++ guesses);
		p = Math.floor(Math.random() * 96);
		while (pen[p] > -1) p = Math.floor(Math.random() * 96);
		for (var j = 0; j < 16; ++j)
			if (pencil[p][j]) {
				v = Math.floor(Math.random() * 16);
				while (!pencil[p][v]) v = Math.floor(Math.random() * 16);
				penin(p, v, true);
				clues[p] = v;
				break;
			} else if (j == 15) return;
	}
}