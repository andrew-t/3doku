var solved = false;
function check(hint) {
	if (hint) clearHighlights();
	op = 0;
	for (var i = 0; i < 96; ++i)
		if (pen[i] > -1) ++op;
	if ((op < 96) && (!hint)) return;
	for (var i = 0; i < 96; ++i)
		if (pen[i] == sol[i]) --op;
		else if ((pen[i] > -1) && (hint)) $('td#' + i).addClass('wrong');
	if (hint) {
		if (op == 0) alert("All your answers are correct.");
		else if (op == 1) alert("The highlighted cell is wrong.");
		else alert("The highlighted cells are wrong.");
	} else if (op > 0) alert("At least one cell is wrong.");
	else if (!solved) {
		solved = true;
		alert("You solved the cube!");
	}
}
function solve(hint) {
	if (hint) {
		var prepencil = clonepencil(pencil);
		autopencil();
	}
	// done ?
	op = 0;
	for (var i = 0; i < 96; ++i)
		if (pen[i] > -1) ++op;
	if (op == 96) return 2;
	// cells that can only be one thing
	for (var i = 0; i < 96; ++i) {
		op = 0;
		for (var j = 0; j < 16; ++j)
			if (pencil[i][j]) 
				if (++op >= 2) break;
		if (op == 0) {	
			console.log("  nothing can go in cell " + (i + 1));
			return -1;
		} else if ((op == 1) && (pen[i] == -1)) {
			if (hint) {
				highlightCell(i);
				pencil = clonepencil(prepencil);
				alert("You can fill in the highlighted cell.");
			} else for (var j = 0; j < 16; ++j)
				if (pencil[i][j]) penin(i, j, true);
			return 1;
		}
	}
	// houses with only one space for a number
	for (var h = 0; h < 18; ++h) 
		for (var j = 0; j < 16; ++j) {
			op = 0;
			pos = -1;
			for (var i = 0; i < 16; ++i)
				if (pencil[houses[h][i]][j]) {
					if (++op >= 2) break;
					pos = houses[h][i];
				}
			if (op == 0) {	
				console.log("  no " + (j + 1) + " can go in house " + (h + 1));
				return -1;
			}
			else if ((op == 1) && (pen[pos] == -1)) {
				if (hint) {
					clearHighlights();
					highlightHouse(h);
					pencil = clonepencil(prepencil);
					alert("Try putting a " + (j + 1) + " in the highlighted group.");
				} else penin(pos, j, true);
				return 1;
			}
	}//*/
	if (hint) {
		pencil = clonepencil(prepencil);
		alert("Sorry, I can't find anything you can do.");
	}
	return 0;
}
function clonepencil(prepencil) {
	postpencil = new Array();
	for (var i = 0; i < 96; ++i) {
		postpencil[i] = new Array();
		for (var j = 0; j < 16; ++j)
			postpencil[i][j] = prepencil[i][j];
	}
	return postpencil;
}
function penin(cell, value, solve) {
	pen[cell] = value;
	if (value > -1) {
		for (var h = 0; h < 18; ++h)
			for (var j = 0; j < 16; ++j)
				if (houses[h][j] == cell) {
					for (var k = 0; k < 16; ++k)
						pencil[houses[h][k]][value] = false;
					break;
				}
		for (var k = 0; k < 16; ++k)
			pencil[cell][k] = false;
		pencil[cell][value] = true;
	}
	if (solve) sol[cell] = value;
}
var houses = (function initHouses() {
	var i, j, houses = [];
	for (i = 0; i < 6; ++i) {
		houses[i] = [];
		for (j = 0; j < 16; ++j)
			houses[i][j] = j + i * 16;
	}
	for (i = 0; i < 4; ++i) {
		houses[i + 6] = new Array();
		var l = 0;
		for (j = 0; j < 6; ++j)
			if (j == 1)
				for (var k = 0; k < 4; ++k)
					houses[i + 6][l++] = k * 4 + j * 16 + 3 - i;
			else if ((j < 2) || (j > 3))
				for (var k = 0; k < 4; ++k)
					houses[i + 6][l++] = k * 4 + j * 16 + i;
	}
	for (i = 0; i < 4; ++i) {
		houses[i + 10] = new Array();
		var l = 0;
		for (j = 0; j < 4; ++j)
			for (var k = 0; k < 4; ++k)
				houses[i + 10][l++] = k + j * 16 + i * 4;
	}
	for (i = 0; i < 4; ++i) {
		houses[i + 14] = new Array();
		var l = 0, k;
		for (k = 0; k < 4; ++k)
			houses[i + 14][l++] = k * 4 + 32 + 3 - i;
		for (k = 0; k < 4; ++k)
			houses[i + 14][l++] = k * 4 + 48 + i;
		for (k = 0; k < 4; ++k)
			houses[i + 14][l++] = k + 64 + i * 4;
		for (k = 0; k < 4; ++k)
			houses[i + 14][l++] = k + 80 + 12 - i * 4;
	}
	return houses;
}());

function autopencil() {
	for (var i = 0; i < 96; ++i) {
		pencil[i] = new Array();
		for (var j = 0; j < 16; ++j) pencil[i][j] = true;
	}
	for (var i = 0; i < 96; ++i)
		if (pen[i] > -1) penin(i, pen[i], false);
	if (currdigit > -1)  highlightDigit(currdigit);
}