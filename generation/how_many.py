def how_many(n):
	how_many = []
	for i in range(1 << n):
		m = 0
		for j in range(n):
			if i & (1 << j): m += 1
		how_many.append(m)
	return how_many
