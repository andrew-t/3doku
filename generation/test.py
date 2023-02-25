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

	def test_pointer(self):
		grid = flat_grid.flat_from_string("""
			____
			____
			12__
			____
		""")
		grid.solve(
			# debug=test_flat.debug,
			using_pointers=True
		)
		self.assertEqual(len(grid.moves), 1)
		move = grid.moves[0]
		self.assertEqual(move['group'], 7)
		self.assertEqual(set(move['numbers']), { 2, 3 })
		self.assertEqual(set(move['couldBe']), { 14, 15 })
		self.assertEqual(grid.cells[14].pencil, { 2, 3 })
		self.assertEqual(grid.cells[15].pencil, { 2, 3 })

if __name__ == '__main__':
	unittest.main()
