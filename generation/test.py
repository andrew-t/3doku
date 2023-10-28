#!/usr/bin/env python3

import unittest

from group import GroupPartition, Group
from sudoku import Sudoku
from cell import Cell

import flat_grid
import test_flat

def partitions(group):
	return partitions_direct(group.partitions)
def partitions_direct(partitions):
	return frozenset(
		frozenset( cell.i for cell in partition )
		for partition in partitions
	)

class TestGrid(unittest.TestCase):

	def test_get_partition(self):
		group = Group(0)
		cells = [Cell([group], 4) for i in range(4)]
		grid = Sudoku([group], cells)
		self.assertEqual([group.partition_for(cells[0])], group.partitions)

	def test_rule_out(self):
		group = Group(0)
		cells = [Cell([group], 4) for i in range(4)]
		grid = Sudoku([group], cells)
		cells[0].rule_out(0)
		grid.solve()
		self.assertEqual(cells[0].pencil, {1, 2, 3})

	def test_rule_out_get_partition(self):
		group = Group(0)
		cells = [Cell([group], 4) for i in range(4)]
		grid = Sudoku([group], cells)
		partition = group.partitions[0]
		cells[0].rule_out(0)
		grid.solve()
		self.assertEqual([group.partition_for(cells[0])], [partition])

	def test_rule_out_2(self):
		group = Group(0)
		cells = [Cell([group], 4) for i in range(4)]
		grid = Sudoku([group], cells)
		cells[0].rule_out(0)
		cells[0].rule_out(1)
		grid.solve()
		self.assertEqual(cells[0].pencil, {2, 3})

	def test_rule_out_2_split(self):
		group = Group(0)
		cells = [Cell([group], 4) for i in range(4)]
		grid = Sudoku([group], cells)
		cells[0].rule_out(0)
		cells[1].rule_out(0)
		grid.solve()
		self.assertEqual(cells[0].pencil, {1, 2, 3})

	def test_partition(self):
		group = Group(0)
		cells = [Cell([group], 4) for i in range(4)]
		grid = Sudoku([group], cells)
		self.assertEqual(
			partitions(group),
			frozenset([frozenset([0, 1, 2, 3])])
		)
		cells[0].rule_out(0)
		cells[0].rule_out(1)
		cells[1].rule_out(0)
		cells[1].rule_out(1)
		cells[2].rule_out(2)
		cells[2].rule_out(3)
		cells[3].rule_out(2)
		cells[3].rule_out(3)
		grid.solve()
		self.assertEqual(
			partitions(group),
			frozenset([frozenset([0, 1]), frozenset([2, 3])])
		)

	def test_partition_2(self):
		group = Group(1)
		cells = [Cell([group], 0), Cell([group], 1), Cell([group], 2)]
		grid = Sudoku([group], cells)
		cells[0].pencil = set([2])
		cells[1].pencil = set([0, 1])
		cells[2].pencil = set([0, 1, 2])
		partition = GroupPartition(group, cells)
		self.assertEqual(partition.partition(), False)

	def test_set_answer(self):
		group = Group(0)
		cells = [Cell([group], 4) for i in range(4)]
		Sudoku([group], cells)
		cells[0].set_answer(0)
		self.assertEqual(cells[1].pencil, { 1, 2, 3 })
		cells[1].set_answer(1)
		self.assertEqual(cells[2].pencil, { 2, 3 })

	def test_partition_deduction(self):
		grid = flat_grid.flat_from_string("""
			____
			____
			12__
			____
		""")
		grid.solve(
			# debug=test_flat.debug,
			using_partitions=True
		)
		self.assertEqual(len(grid.moves), 1)
		move = grid.moves[0]
		self.assertEqual(move['group'], 7)
		self.assertEqual(set(move['numbers']), { 0, 1 })
		self.assertEqual(set(move['couldBe']), { 14, 15 })
		self.assertEqual(grid.cells[14].pencil, { 0, 1 })
		self.assertEqual(grid.cells[15].pencil, { 0, 1 })

	def test_x_wing(self):
		# the X cells in the first column must be 3 and 4
		# the X cells in the third column must be 1 and 3
		# either way, two opposite corners of the X-wing must be 3s
		# and therefore neither cell marked . can be a 3
		# (the extra 2s are in there just because you can work them out anyway)
		grid = flat_grid.flat_from_string("""
			1_2_
			x2x.
			2_4_
			x.x2
		""")
		grid.solve(
			# debug=test_flat.debug,
			using_x_wings=True
		)
		self.assertTrue(len(grid.moves) >= 1)
		xw = grid.moves[0]
		self.assertEqual(set(xw["cells"]), { 4, 6, 12, 14 })
		self.assertEqual(set(xw["ruledOutFrom"]), { 7, 13 })
		self.assertEqual(set(xw["groups"]), { 0, 2 })
		self.assertEqual(xw["pivotValue"], 2)

	def test_swordfish(self):
		# e is either end of the loop
		# the x-chain proves one of the e's must be a 4
		# also, the y-chain proves one of the E's must be a 4
		# either way, the . cell can't be a 4
		# because the e's (or E's) form a pointer to it
		grid = flat_grid.flat_from_string("""
			195 367 248
			E78 .5E 369
			3x6 e98 157

		    __3 78y 59y
		    7_9 e_5 x_6
		    584 9_6 71_
		    
		    832 549 671
		    9x7 _13 x25
		    y51 _72 9_y
		""")
		grid.solve(
			# debug=test_flat.debug,
			using_swordfish=True
		)
		# print(grid.moves)
		# this actually finds a second "swordfish" in the fourth column
		# but it's really just a pointer, which is technically a special case of swordfish
		# so since pointers are turned off here, we get it twice
		self.assertTrue(len(grid.moves) >= 1)
		sf = grid.moves[0]
		self.assertEqual(sf["value"], 3)
		self.assertEqual(sf["ruledOutFrom"], [12])

if __name__ == '__main__':
	unittest.main()