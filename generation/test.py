#!/usr/bin/env python3

from sudoku import Sudoku
from group import Group
from cell import Cell
from how_many import how_many

print("building setup")
group_under_test = Group(0)
print("building setup")
cells = [Cell([group_under_test]) for i in range(4)]
print("building setup")
grid = Sudoku([group_under_test], cells, how_many(4))

# only cells 0 and 1 can have a 2 or 3 in them
# but they can also have other numbers
cells[0].pencil = 15
cells[1].pencil = 14
cells[2].pencil = 3
cells[3].pencil = 3

# we should be able to deduce they can't be 0 or 1
print("starting search")
result = grid.find_move(using_pointers = True)

if not result:
	print("❌ couldn't find a move")
	exit()

print(grid.moves)

pencils = [ cell.pencil for cell in cells ]
if pencils != [ 12, 12, 3, 3 ]:
	print("❌ pencils were wrong")
	print(pencils)
	exit()

print("✅ all good!")
