import random

from cell import Cell
from group import Group, GroupDeduction, GroupPartition
from queue import PrioritisedQueue

from combinatorics import every_combination_of

class Sudoku:
	def __init__(self, groups, cells):
		self.groups = groups
		self.cells = cells
		self.moves = []
		self.n = len(self.groups[0])
		self.deduction_queue = PrioritisedQueue()
		for group in self.groups:
			group.freeze(self)
		for i in range(len(self.cells)):
			self.cells[i].i = i
			self.cells[i].grid = self
		# self.check()

	def clone(self, no_answers=False):
		new_groups = [Group(group.i) for group in self.groups]
		new_cells = [cell.clone(new_groups, no_answers) for cell in self.cells]
		cosima = Sudoku(new_groups, new_cells)
		cosima.moves = [m for m in self.moves]
		cosima.checked_moves = set(self.checked_moves)
		return cosima

	def check(self):
		for group in self.groups:
			assert len(group) == self.n

	def answers(self):
		return [ cell.answer for cell in self.cells ]

	def clues(self):
		return [ cell.i for cell in self.cells if cell.is_clue ]

	def to_json(self):
		return {
			"answers": self.answers(),
			"clues": self.clues(),
			"moves": self.moves
		}

	def unsolved_cells(self):
		return ( cell for cell in self.cells if not cell.answer_known )

	def is_solved(self):
		return all(cell.answer_known for cell in self.cells)

	# returns true on success and false on failure
	def try_generate(self, debug=None, **kwargs):
		while True:
			if self.solve(debug=debug, **kwargs): return True
			if not self.add_random_clue(debug=debug): return False

	# returns true on success and false on failure
	def add_random_clue(self, debug=None):
		cell = random.choice(list(self.unsolved_cells()))
		if not cell.pencil: return False
		cell.make_clue()
		self.moves.append({
			"cell": cell.i,
			"randomlyAssigned": cell.answer
		})
		if debug: debug(self)
		return True

	# returns true on success and false on failure
	# returns NONE when the puzzle is invalid
	def solve(self, **kwargs):
		while True:
			result = self.find_move(**kwargs)
			if result is None: return None
			if not result: return False
			if self.is_solved(): return True
			if "debug" in kwargs and kwargs["debug"]: kwargs["debug"](self)

	# returns true if it found a move, false otherwise
	# returns NONE when the puzzle is invalid
	def find_move(self,
		using_pointers=False,
		using_x_wings=False,
		debug=None
	):
		while self.deduction_queue.has_items():
			candidate = self.deduction_queue.pop()
			match candidate:

				case Cell():
					# there's only one deduction we can do on a cell, and it's pretty easy
					if len(candidate.pencil) == 1 and not candidate.answer_known:
						n = candidate.pencil.__iter__().__next__()
						candidate.set_answer(n)
						self.moves.append({
							"cell": candidate.i,
							"canOnlyBe": n
						})
						return True

				case GroupDeduction(partition=GroupPartition(exists=False)):
					# this group no longer exists
					pass

				case GroupDeduction(partition=partition, type="partition"):
					partitions = partition.partition()
					if partitions is False:
						partition.enqueue_logic()
					else:
						partition.group.partitions.remove(partition)
						partition.group.partitions += partitions
						partition.exists = False
						for partition in partitions:
							partition.enqueue_logic()
						if debug: debug(self)

				case GroupDeduction(partition=partition, type="only_place"):
					for n in partition.values:
						places = [cell for cell in partition if cell.could_be(n)]
						if not places:
							return None
						if len(places) != 1:
							continue
						if places[0].answer_known:
							continue
						self.moves.append({
							"cell": places[0].i,
							"group": partition.group.i,
							"onlyPlaceFor": n
						})
						places[0].set_answer(n)
						return True

				case GroupDeduction(partition=partition, type="pointers"):
					if not using_pointers: continue
					# partitions of length 1 are trivial and it's convenient to assume they don't exist so filter them out here
					if len(partition) < 2: continue
					# any cells we already know should have been removed from the partition by now
					assert all( not cell.answer_known for cell in partition )

					n = len(partition)
					assert n == len(partition.values)
					for guess_values in every_combination_of(partition.values):
						guess_n = len(guess_values)
						# If guess_n == 0 or guess_n == n then we can't do anything
						# If guess_n == 1 that's the same as "this cell can only be a 4"
						# If guess_n == n - 1 that's the same as "the 4 can only go here"
						# or maybe it's the other way round, whatever
						if guess_n <= 1 or guess_n >= n - 1: continue
						# Find all the cells which can contain any of the numbers we're considering, even if they could contain other things too.
						could_be = [ cell for cell in partition if cell.pencil & guess_values ]
						could_be_n = len(could_be)
						# We only care about the case where N numbers are locked to N cells — so we know those cells can't be anything else.
						if could_be_n != guess_n: continue
						# ok so this means there are (say) 3 numbers that can only possibly be in the same 3 cells in this group
						self.moves.append({
							"group": partition.group.i,
							"numbers": list(guess_values),
							"couldBe": [ cell.i for cell in could_be ]
						})
						# therefore, the cells that COULD be the numbers we're considering can't be anything BUT those numbers — otherwise there wouldn't be space for them.
						for cell in could_be:
							for value in list(cell.pencil):
								if value not in guess_values:
									cell.rule_out(value)
						return True

				case GroupDeduction(partition=partition, type="x_wing"):
					if not using_x_wings: continue
					for value in partition.values:
						could_be = [ cell for cell in partition if cell.could_be(value) ]
						# I suspect you could have a 3x3x3 X-wing, but I've never seen it listed in the literature
						# so maybe you can't for some reason, but also maybe it's deemed unreasonably hard?
						# also it'd probably take bloody ages to solve for, so we can probably leave it out of this
						if len(could_be) != 2: continue
						# so we've identified a digit that can only be in two places in this partition, let's find candidate x-wings
						# and since we're limiting to 2 cells, we can write it out explicitly instead of trying to be clever with iterated loops
						[ a, b ] = could_be
						assert a is not b
						a_partitions = [ group.partition_for(a) for group in a.groups if group != partition.group ]
						b_partitions = [ group.partition_for(b) for group in b.groups if group != partition.group ]
						for a_partition in a_partitions:
							for b_partition in b_partitions:
								for overlap_a in a_partition:
									if overlap_a == a: continue
									for overlap_b in b_partition:
										if overlap_b == b or overlap_b == overlap_a: continue
										overlap_groups = [ group for group in overlap_a.groups if group in overlap_b.groups ]
										# Pretty sure this can only ever have one thing in it but idk, maybe for crazy geometries there can be more?
										for overlap_group in overlap_groups:
											if overlap_group == partition.group: continue
											overlap_partition = overlap_group.partition_for(overlap_a)
											if overlap_b not in overlap_partition: continue
											if value not in overlap_partition.values: continue
											# next we have to check that our overlap partition implies the same fact that only the two cells can be `value`
											if any(
												cell.could_be(value) != (cell is overlap_a or cell is overlap_b)
												for cell in overlap_partition
											): continue
											# looks like we have a legit x-wing. now we need to wipe every candidate for `value` from the perpendicular groups.
											ruled_out_from = []
											for cell in a_partition:
												if cell != a and cell not in overlap_group:
													if cell.could_be(value):
														ruled_out_from.append(cell)
														cell.rule_out(value)
											for cell in b_partition:
												if cell != b and cell not in overlap_group:
													if cell.could_be(value):
														ruled_out_from.append(cell)
														cell.rule_out(value)
											if ruled_out_from:
												self.moves.append({
													"groups": [partition.group.i, overlap_group.i],
													"counterGroups": [a_partition.group.i, b_partition.group.i],
													"cells": [ a.i, b.i, overlap_a.i, overlap_b.i ],
													"pivotValue": value,
													"ruledOutFrom": [ cell.i for cell in ruled_out_from ]
												})
												return True

				case _:
					print(candidate)
					raise Exception("Unexpected candidate")
