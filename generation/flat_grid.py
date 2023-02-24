from group import GroupPartition, Group
from sudoku import Sudoku
from cell import Cell

def FlatGrid(n, pot=None):
	groups = [ Group(i) for i in range(3 * n * n) ]
	cells = []
	for v in range(n):
		for y in range(n):
			for u in range(n):
				for x in range(n):
					cells.append(Cell([
						groups[x + u * n],
						groups[y + v * n + n * n],
						groups[u * n + v + n * n * 2]
					], n * n))
	if pot:
		for i in range(len(cells)):
			cells[i].answer = pot[i].answer
	grid = Sudoku(groups, cells)
	if pot:
		for i in range(len(cells)):
			if pot[i].is_clue:
				cells[i].make_clue()
	return grid

def print_grid(grid):
	for x in range(grid.n):
		for y in range(grid.n):
			cell = grid.cells[x + y * grid.n]
			print(hex(cell.answer)[2] if cell.answer_known else "-", end="")
		print("")
	print("")