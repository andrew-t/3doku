#!/usr/bin/env python3

from flat_grid import FlatGrid, print_grid, print_pencil

def debug(grid):
	if grid.moves: 
		print(len(grid.moves))
		print(grid.moves[-1])
	print_grid(grid)
	print_pencil(grid)
	for group in grid.groups:
		print(f"Group {group.i}: ", end="")
		for partition in group.partitions:
			print(f"P[{','.join( str(cell.i) for cell in partition.cells )}]", end="")
		print("")

def generate(n):
	while True:
		grid = FlatGrid(n)
		debug(grid)
		if not grid.try_generate(debug=debug):
			continue
		print_grid(grid)
		print(grid.moves)
		clues = FlatGrid(n, grid.cells)
		print_grid(clues)
		clues.solve()
		print_grid(clues)
		print_pencil(clues)
		print(clues.moves)
		return

generate(2)
print()
# generate(3)
# print()
# generate(4)
# print()
