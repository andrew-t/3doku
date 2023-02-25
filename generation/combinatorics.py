def every_combination_of(options):
	options = list(options)
	selected = [ False for x in options ]
	n = len(options)
	yield frozenset()
	while True:
		for i in range(n):
			selected[i] = not selected[i]
			if selected[i]: break
		yield frozenset( options[i] for i in range(n) if selected[i] )
		if all(selected): break
