// initialise
window.addEventListener('scroll', e => spincube());
window.addEventListener('resize', onResize);
function onResize() {
	s1 = ($(this).width() - 200) / 400;
	s2 = ($(this).height()) / 400;
	if (s1 > s2) s = s2; else s = s1;
	$('div#cc').css('top', Math.floor(($(this).height()-(200*s))/2) + 'px');
	$('div#cube').css('transform', 'scale('+s+','+s+')');
	$('div#cube').css('-webkit-transform', 'scale('+s+','+s+')');
	$('div#cube').css('-ms-transform', 'scale('+s+','+s+')');
	$('div#cube').css('-o-transform', 'scale('+s+','+s+')');
	$('div#cube').css('-moz-transform', 'scale('+s+','+s+')');
}
window.addEventListener('DOMContentLoaded', function() {
	onResize();
	for (var i = 0; i < 16; ++i)
		$("ul#hlopts").append('<li id="hlo' + i + '">' + (i + 1) + '</li>');
	$("ul#hlopts>li").click(function() { 
		var i = $(this).attr('id').substr(3);
		if (currdigit == i) i = -1;
		highlightDigit(i);
	});
	$("td").each(function(index) {
		if (index < 80) $(this).attr("id", index);
		else $(this).attr("id", 175 - index);
		for (var h = 0; h < 18; ++h)
			for (var j = 0; j < 16; ++j)
				$('td#' + houses[h][j]).addClass('h' + h);
		$(this).mouseover(function() {
			var i = $(this).attr("id");
			if ((currcell == -1) && (currdigit == -1) && (clues[i] == -1))
				highlightNeighbours(i);
		});
		$(this).mouseout(function() {
			if ((currcell == -1) && (currdigit == -1))
				clearHighlights();
		});
		$(this).click(function() {
			if (clues[$(this).attr("id")] == -1) {
				if (currdigit > -1) {
					i = $(this).attr("id");
					pencil[i][currdigit] =! pencil[i][currdigit];
					highlightDigit(currdigit);
				} else $(this).dblclick();
			}
		});
		$(this).dblclick(function() {
			if (clues[$(this).attr("id")] > -1) { currcell = -1; return; }
			currcell = $(this).attr("id");
			highlightNeighbours(currcell);
			if (currcell.indexOf(" ") > -1) { currcell = -1; return; }
			$(this).html('<form onSubmit="return false;"><input id="c" /><form>');
			var el = $('input#c');
			if (pen[currcell] > -1) el.val(pen[currcell] + 1);
			el.blur(function() { 
				var v = $(this).val() - 1;
				if ((v < 0) || (v > 15) || (v.length == 0)) v = -1;
				penin(currcell, v, false);
				clearHighlights();
				drawCube();
				check();
			});
			el.focus();
		});
	});
	spincube(0.5);
	newCube();
	$(this).resize();
});

// graphics and so on
var nt = "translate3d(0, 0, 100px)";
var ft = "translate3d(0, 0, -100px) rotateY(180deg)";
var tt = "translate3d(0, -100px, 0) rotateX(90deg)";
var bt = "translate3d(0, 100px, 0) rotateX(-90deg) rotateZ(180deg)";
var lt = "translate3d(100px, 0, 0) rotateY(90deg)";
var rt = "translate3d(-100px, 0, 0) rotateY(-90deg)";
var gt = "rotate3d(0.7, 0, 0.7, -54.74deg)";
function drawCube() {
	var counts = new Array();
	for (var i = 0; i < 16; ++i) counts[i] = 0;
	for (var i = 0; i < 96; ++i) ++counts[pen[i]];
	for (var i = 0; i < 96; ++i) {
		if (clues[i] > -1) {
			$('td#' + i).html(clues[i] + 1);
			$('td#' + i).addClass("clue");
			if (counts[clues[i]] == 6) $('td#' + i).addClass("done");
			else $('td.done#' + i).removeClass("done");
		} else if (pen[i] > -1) {
			$('td#' + i).html(pen[i] + 1);
			if (counts[pen[i]] == 6) $('td#' + i).addClass("done");
			else $('td.done#' + i).removeClass("done");
			if (counts[pen[i]] > 6) $('td#' + i).addClass("wrong");
			else $('td.wrong#' + i).removeClass("wrong");
		} else {
			$('td#' + i).html("");
			$('td.done#' + i).removeClass("done");
			$('td.wrong#' + i).removeClass("wrong");
		}
	}
	currcell = -1;
}
function spincube(x) {
	const w = document.getElementById('scroller').clientWidth - (document.body.scrollWidth || window.scrollWidth);
	if (x == null) x = document.scrollingElement.scrollLeft * 3 / w;
	else document.scrollingElement.scrollLeft = window.scrollX = x * w / 3;
	if (x > 2) spincube(x - 1);
	else if (x < 1) spincube(x + 1);
	else {
		var scrt = "rotateY(" + (360 * x) + "deg)";
		$("div#n").css("-webkit-transform", scrt + " " + gt + " " + nt);
		$("div#f").css("-webkit-transform", scrt + " " + gt + " " + ft);
		$("div#t").css("-webkit-transform", scrt + " " + gt + " " + tt);
		$("div#b").css("-webkit-transform", scrt + " " + gt + " " + bt);
		$("div#r").css("-webkit-transform", scrt + " " + gt + " " + rt);
		$("div#l").css("-webkit-transform", scrt + " " + gt + " " + lt);
		$("div#n").css("-moz-transform", scrt + " " + gt + " " + nt);
		$("div#f").css("-moz-transform", scrt + " " + gt + " " + ft);
		$("div#t").css("-moz-transform", scrt + " " + gt + " " + tt);
		$("div#b").css("-moz-transform", scrt + " " + gt + " " + bt);
		$("div#r").css("-moz-transform", scrt + " " + gt + " " + rt);
		$("div#l").css("-moz-transform", scrt + " " + gt + " " + lt);
		$("div#n").css("-ms-transform", scrt + " " + gt + " " + nt);
		$("div#f").css("-ms-transform", scrt + " " + gt + " " + ft);
		$("div#t").css("-ms-transform", scrt + " " + gt + " " + tt);
		$("div#b").css("-ms-transform", scrt + " " + gt + " " + bt);
		$("div#r").css("-ms-transform", scrt + " " + gt + " " + rt);
		$("div#l").css("-ms-transform", scrt + " " + gt + " " + lt);
		$("div#n").css("transform", scrt + " " + gt + " " + nt);
		$("div#f").css("transform", scrt + " " + gt + " " + ft);
		$("div#t").css("transform", scrt + " " + gt + " " + tt);
		$("div#b").css("transform", scrt + " " + gt + " " + bt);
		$("div#r").css("transform", scrt + " " + gt + " " + rt);
		$("div#l").css("transform", scrt + " " + gt + " " + lt);
		// workaround for backfaces bug in chrome
		if ((x > 1.209375) && (x < 1.70625)) $("div#n").hide(); else $("div#n").show();
		if ((x > 1.209375) && (x < 1.70625)) $("div#f").show(); else $("div#f").hide();
		if ((x > 1.04140625) && (x < 1.54296875)) $("div#l").hide(); else $("div#l").show();
		if ((x > 1.04140625) && (x < 1.54296875)) $("div#r").show(); else $("div#r").hide();
		if ((x > 1.37578125) && (x < 1.8765625)) $("div#t").hide(); else $("div#t").show();
		if ((x > 1.37578125) && (x < 1.8765625)) $("div#b").show(); else $("div#b").hide();
		x = x * 6 * Math.PI;
		a = Math.round(Math.sin(x) * 20 + 205);
		$('td.h5').css('background', 'rgb(' + a + ',' + a + ',' + a + ')');
		a = Math.round(Math.sin(x + 1) * 20 + 235);
		$('td.h2').css('background', 'rgb(' + a + ',' + a + ',' + a + ')');
		a = Math.round(Math.sin(x + 2) * 20 + 205);
		$('td.h0').css('background', 'rgb(' + a + ',' + a + ',' + a + ')');
		a = Math.round(Math.sin(x + 3) * 20 + 235);
		$('td.h4').css('background', 'rgb(' + a + ',' + a + ',' + a + ')');
		a = Math.round(Math.sin(x + 4) * 20 + 205);
		$('td.h3').css('background', 'rgb(' + a + ',' + a + ',' + a + ')');
		a = Math.round(Math.sin(x + 5) * 20 + 235);
		$('td.h1').css('background', 'rgb(' + a + ',' + a + ',' + a + ')');
	}
}

// general sudoku logic
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
var houses = new Array(); initHouses();
function initHouses() {
	for (var i = 0; i < 6; ++i) {
		houses[i] = new Array();
		for (var j = 0; j < 16; ++j)
			houses[i][j] = j + i * 16;
	}
	for (var i = 0; i < 4; ++i) {
		houses[i + 6] = new Array();
		var l = 0;
		for (var j = 0; j < 6; ++j)
			if (j == 1)
				for (var k = 0; k < 4; ++k)
					houses[i + 6][l++] = k * 4 + j * 16 + 3 - i;
			else if ((j < 2) || (j > 3))
				for (var k = 0; k < 4; ++k)
					houses[i + 6][l++] = k * 4 + j * 16 + i;
	}
	for (var i = 0; i < 4; ++i) {
		houses[i + 10] = new Array();
		var l = 0;
		for (var j = 0; j < 4; ++j)
			for (var k = 0; k < 4; ++k)
				houses[i + 10][l++] = k + j * 16 + i * 4;
	}
	for (var i = 0; i < 4; ++i) {
	houses[i + 14] = new Array();
	var l = 0;
	for (var k = 0; k < 4; ++k)
		houses[i + 14][l++] = k * 4 + 32 + 3 - i;
	for (var k = 0; k < 4; ++k)
		houses[i + 14][l++] = k * 4 + 48 + i;
	for (var k = 0; k < 4; ++k)
		houses[i + 14][l++] = k + 64 + i * 4;
	for (var k = 0; k < 4; ++k)
		houses[i + 14][l++] = k + 80 + 12 - i * 4;
}
}
function autopencil() {
	for (var i = 0; i < 96; ++i) {
		pencil[i] = new Array();
		for (var j = 0; j < 16; ++j) pencil[i][j] = true;
	}
	for (var i = 0; i < 96; ++i)
		if (pen[i] > -1) penin(i, pen[i], false);
	if (currdigit > -1)  highlightDigit(currdigit);
}

// generate a puzzle
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

// highlight things
var currcell = -1; var currdigit = -1;
function highlightDigit(d) {
	clearHighlights();
	if (d == "") d = -1;
	currdigit = d;
	$("ul#hlopts>li.hl1").removeClass('hl1');
	$("ul#hlopts>li#hlo" + d).addClass('hl1');
	if (d >= 0) {
		for (var i = 0; i < 96; ++i)
			if (pencil[i][d])
				$('td#' + i).addClass('hl1');
	}
}
function highlightCell(i) {
	clearHighlights();
	$('td#' + i).addClass('hl1');
}
function highlightHouse(h, col) {
	if (col == null) col = 'hl1';
	$('td.h' + h).addClass(col);
}
function highlightNeighbours(i) {
	clearHighlights();
	for (var h = 0; h < 6; ++h)
		for (var j = 0; j < 16; ++j)
			if (houses[h][j] == i) {
				highlightHouse(h, 'hl1');
				break;
			}
	for (var h = 6; h < 10; ++h)
		for (var j = 0; j < 16; ++j)
			if (houses[h][j] == i) {
				highlightHouse(h, 'hl2');
				break;
			}
	for (var h = 10; h < 14; ++h)
		for (var j = 0; j < 16; ++j)
			if (houses[h][j] == i) {
				highlightHouse(h, 'hl3');
				break;
			}
	for (var h = 14; h < 18; ++h)
		for (var j = 0; j < 16; ++j)
			if (houses[h][j] == i) {
				highlightHouse(h, 'hl4');
				break;
			}
	$('td#' + i).addClass('hl5');
}
function clearHighlights() {
	currdigit = -1;
	for (var i = 1; i <= 6; ++i)
		$('td.hl' + i).removeClass('hl' + i);
	$("ul#hlopts>li.hl1").removeClass('hl1');
	$("ul#hlopts>li#hlo-1").addClass('hl1');
}
