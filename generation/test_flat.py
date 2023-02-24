#!/usr/bin/env python3

from flat_grid import FlatGrid, print_grid

def generate(n):
	while True:
		grid = FlatGrid(n)
		if not grid.try_generate():
			continue
		print_grid(grid)
		clues = FlatGrid(n, grid.cells)
		print_grid(clues)
		clues.solve()
		print_grid(clues)
		print(clues.moves)
		return

generate(2)
print()
generate(3)
print()
# generate(4)
# print()
