var nt = "translate3d(0, 0, 100px)",
	ft = "translate3d(0, 0, -100px) rotateY(180deg)",
	tt = "translate3d(0, -100px, 0) rotateX(90deg)",
	bt = "translate3d(0, 100px, 0) rotateX(-90deg) rotateZ(180deg)",
	lt = "translate3d(100px, 0, 0) rotateY(90deg)",
	rt = "translate3d(-100px, 0, 0) rotateY(-90deg)",
	gt = "rotate3d(0.7, 0, 0.7, -54.74deg)";
function drawCube() {
	var counts = [], i;
	for (i = 0; i < 16; ++i) counts[i] = 0;
	for (i = 0; i < 96; ++i) ++counts[pen[i]];
	for (i = 0; i < 96; ++i) {
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
	if (x == null) x = $("body").scrollLeft() / $("body").width();
	else $("body").scrollLeft(x * $("body").width());
	if (x > 2) spincube(x - 1);
	else if (x < 1) spincube(x + 1);
	else {
		var scrt = "rotateY(" + (360 * x) + "deg)";
		$("div#n").css({
			"-webkit-transform": scrt + " " + gt + " " + nt,
			"-moz-transform": scrt + " " + gt + " " + nt,
			"-ms-transform": scrt + " " + gt + " " + nt,
			"transform": scrt + " " + gt + " " + nt
		});
		$("div#f").css({
			"-webkit-transform": scrt + " " + gt + " " + ft,
			"-moz-transform": scrt + " " + gt + " " + ft,
			"-ms-transform": scrt + " " + gt + " " + ft,
			"transform": scrt + " " + gt + " " + ft
		});
		$("div#t").css({
			"-webkit-transform": scrt + " " + gt + " " + tt,
			"-moz-transform": scrt + " " + gt + " " + tt,
			"-ms-transform": scrt + " " + gt + " " + tt,
			"transform": scrt + " " + gt + " " + tt
		});
		$("div#b").css({
			"-webkit-transform": scrt + " " + gt + " " + bt,
			"-moz-transform": scrt + " " + gt + " " + bt,
			"-ms-transform": scrt + " " + gt + " " + bt,
			"transform": scrt + " " + gt + " " + bt
		});
		$("div#r").css({
			"-webkit-transform": scrt + " " + gt + " " + rt,
			"-moz-transform": scrt + " " + gt + " " + rt,
			"-ms-transform": scrt + " " + gt + " " + rt,
			"transform": scrt + " " + gt + " " + rt
		});
		$("div#l").css({
			"-webkit-transform": scrt + " " + gt + " " + lt,
			"-moz-transform": scrt + " " + gt + " " + lt,
			"-ms-transform": scrt + " " + gt + " " + lt,
			"transform": scrt + " " + gt + " " + lt
		});
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