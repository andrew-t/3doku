var currcell = -1,
	currdigit = -1;

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
