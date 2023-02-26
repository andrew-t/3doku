from sudoku import Sudoku
from group import Group
from cell import Cell

# don't bother generating the grid, we did that in js and here is the result:
cell_groups = [
	(12, 0, 4),(12, 0, 5),(12, 0, 6),(12, 0, 7),
	(12, 1, 4),(12, 1, 5),(12, 1, 6),(12, 1, 7),
	(12, 2, 4),(12, 2, 5),(12, 2, 6),(12, 2, 7),
	(12, 3, 4),(12, 3, 5),(12, 3, 6),(12, 3, 7),
	(13, 0, 7),(13, 0, 6),(13, 0, 5),(13, 0, 4),
	(13, 1, 7),(13, 1, 6),(13, 1, 5),(13, 1, 4),
	(13, 2, 7),(13, 2, 6),(13, 2, 5),(13, 2, 4),
	(13, 3, 7),(13, 3, 6),(13, 3, 5),(13, 3, 4),
	(14, 8, 4),(14, 8, 5),(14, 8, 6),(14, 8, 7),
	(14, 9, 4),(14, 9, 5),(14, 9, 6),(14, 9, 7),
	(14,10, 4),(14,10, 5),(14,10, 6),(14,10, 7),
	(14,11, 4),(14,11, 5),(14,11, 6),(14,11, 7),
	(15, 8, 7),(15, 8, 6),(15, 8, 5),(15, 8, 4),
	(15, 9, 7),(15, 9, 6),(15, 9, 5),(15, 9, 4),
	(15,10, 7),(15,10, 6),(15,10, 5),(15,10, 4),
	(15,11, 7),(15,11, 6),(15,11, 5),(15,11, 4),
	(16, 0,11),(16, 0,10),(16, 0, 9),(16, 0, 8),
	(16, 1,11),(16, 1,10),(16, 1, 9),(16, 1, 8),
	(16, 2,11),(16, 2,10),(16, 2, 9),(16, 2, 8),
	(16, 3,11),(16, 3,10),(16, 3, 9),(16, 3, 8),
	(17, 0, 8),(17, 0, 9),(17, 0,10),(17, 0,11),
	(17, 1, 8),(17, 1, 9),(17, 1,10),(17, 1,11),
	(17, 2, 8),(17, 2, 9),(17, 2,10),(17, 2,11),
	(17, 3, 8),(17, 3, 9),(17, 3,10),(17, 3,11)
]

"""

CELL IDS:

  YELLOW:
  32 33 34 35
  36 37 38 39
  40 41 42 43
  44 45 46 47

  GREEN:       BLUE:        RED:         TEAL:
  00 01 02 03  64 65 66 67  16 17 18 19  80 81 82 83
  04 05 06 07  68 69 70 71  20 21 22 23  84 85 86 87
  08 09 10 11  72 73 74 75  24 25 26 27  88 89 90 91
  12 13 14 15  76 77 78 79  28 29 30 31  92 93 94 95

                            PURPLE:
                            48 49 50 51
                            52 53 54 55
                            56 57 58 59
                            60 61 62 63

FACE IDS:

 2		YELLOW
 0415   GREEN- BLUE-- RED--- TEAL--
   3                  PURPLE

GROUP IDs:

 ....
 ....
 ....
 ....
 0-------------->
 1-------------->
 2-------------->
 3-------------->
         ....
         ....
         ....
         ....
	 
 4567
 ||||
 ||||
 ||||
 ||||....7654....
 ||||....||||....
 ||||....||||....
 vvvv....||||....
         ||||
         ||||
         ||||
         vvvv
	 
 8-->
 9-->
 10->
 11->
 ....1198....8911
 ....10||....||01
 ....||||....||||
 ....vvvv....vvvv
         8-->
         9-->
         10->
         11->

 /--\ 
 |14|
 |Y.|
 \--/
 /--\/--\/--\/--\ 
 |12||16||13||17|
 |G.||B.||R.||C.|
 \--/\--/\--/\--/
         /--\ 
         |15|
         |M.|
         \--/

"""


def Sudokube(answers=None, clues=None):
	groups = [ Group(i) for i in range(18) ]
	cells = [
		Cell([groups[g1], groups[g2], groups[g3]], 16)
			for (g1, g2, g3) in cell_groups
	]
	if answers:
		for i in range(len(cells)):
			cells[i].answer = answers[i]
	grid = Sudoku(groups, cells)
	if clues:
		for i in clues:
			cells[i].make_clue()
	return grid
