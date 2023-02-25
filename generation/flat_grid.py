from collections import namedtuple

from group import GroupPartition, Group
from sudoku import Sudoku
from cell import Cell

Pot = namedtuple('Pot', ['answer', 'is_clue'])
def flat_from_string(str):
	pot = [
		(Pot(None, False) if char == '_' else Pot(int(char) + 1, True))
		for char in str.strip()
		if char.strip()
	]
	return FlatGrid(int(len(pot) ** 0.25), pot)

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
	for y in range(grid.n):
		for x in range(grid.n):
			cell = grid.cells[x + y * grid.n]
			print(hex(cell.answer)[2] if cell.answer_known else "-", end="")
		print("")
	print("")

def print_pencil(grid):
	for y in range(grid.n):
		for n in range(grid.n):
			for x in range(grid.n):
				cell = grid.cells[x + y * grid.n]
				print("." if cell.answer_known else
					n if n in cell.pencil
					else "-", end="")
			print("  ", end="")
		print("")
	print("")