$(this).scroll(function() { spincube(); });
$(this).resize(function() {
	s1 = ($(this).width() - 200) / 400;
	s2 = ($(this).height()) / 400;
	if (s1 > s2) s = s2; else s = s1;
	$('div#cc').css('top', Math.floor(($(this).height()-(200*s))/2) + 'px');
	$('div#cube').css('transform', 'scale('+s+','+s+')');
	$('div#cube').css('-webkit-transform', 'scale('+s+','+s+')');
	$('div#cube').css('-ms-transform', 'scale('+s+','+s+')');
	$('div#cube').css('-o-transform', 'scale('+s+','+s+')');
	$('div#cube').css('-moz-transform', 'scale('+s+','+s+')');
});
$(this).load(function() {
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