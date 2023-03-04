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
	
	def log_move(self, move, verbose):
		self.moves.append(move)
		if verbose: print("Adding deduction:", move)

	# returns true if it found a move, false otherwise
	# returns NONE when the puzzle is invalid
	def find_move(self,
		using_pointers=False,
		using_partitions=False,
		using_x_wings=False,
		using_swordfish=False,
		debug=None,
		verbose=False
	):
		while self.deduction_queue.has_items():
			candidate = self.deduction_queue.pop()
			if verbose:
				match candidate:
					case Cell(i=i):
						print(f"Checking cell {i}")
					case GroupDeduction(partition=partition, type=type):
						if partition.exists:
							print(f"Checking partition: group {partition.group.i}, cells {numlist(partition)} for option {type}")
						else:
							print(f"Skipping ex-partition group {partition.group.i}, cells {numlist(partition)} for option {type}")
			match candidate:

				case Cell():
					# there's only one deduction we can do on a cell, and it's pretty easy
					if len(candidate.pencil) == 1 and not candidate.answer_known:
						n = candidate.pencil.__iter__().__next__()
						candidate.set_answer(n)
						self.log_move({
							"cell": candidate.i,
							"canOnlyBe": n
						}, verbose)
						return True

				case GroupDeduction(partition=GroupPartition(exists=False)):
					# this group no longer exists
					pass

				case GroupDeduction(partition=partition, type="partition"):
					partitions = partition.partition()
					if partitions is False:
						# if verbose: print(f"Could not partition group {partition.group.i}")
						partition.enqueue_logic()
					else:
						partition.group.partitions.remove(partition)
						partition.group.partitions += partitions
						partition.exists = False
						for partition in partitions:
							partition.enqueue_logic()
						if debug: debug(self)
						if verbose:
							print(f"Partitioning group {partition.group.i}:")
							for partition in partitions:
								print(f" - Cells {numlist(partition)} have {numlist(partition.values)}")

				case GroupDeduction(partition=partition, type="only_place"):
					for n in partition.values:
						places = [cell for cell in partition if cell.could_be(n)]
						if not places: return None
						if len(places) != 1: continue
						if places[0].answer_known: continue
						self.log_move({
							"cell": places[0].i,
							"group": partition.group.i,
							"onlyPlaceFor": n
						}, verbose)
						places[0].set_answer(n)
						return True

				case GroupDeduction(partition=partition, type="pointers"):
					if not using_pointers: continue
					if len(partition) < 2: continue
					assert all( not cell.answer_known for cell in partition )
					for value in partition.values:
						could_be = [ cell for cell in partition if cell.could_be(value) ]
						other_groups = [
							group for group in could_be[0].groups
							if all( group in cell.groups for cell in could_be )
						]
						if len(other_groups) == 1:
							assert other_groups == [partition.group]
							continue
						# Pretty sure this can only ever have one thing in it but idk, maybe for crazy geometries there can be more?
						for other_group in other_groups:
							if other_group is partition.group: continue
							could_be_here = [
								cell for cell in other_group
								if cell.could_be(value) and cell not in partition
							]
							if not could_be_here: continue
							self.log_move({
								"pointingGroup": partition.group.i,
								"pointingValue": value,
								"pointingIntoGroup": other_group.i,
								"pointingCells": [ cell.i for cell in could_be ],
								"affectedCells": [ cell.i for cell in could_be_here ]
							}, verbose)
							for cell in could_be_here:
								cell.rule_out(value)
							# Push the logic step back onto the queue in case there's more than one deduction we can make here. (We didn't need this before as anything that writes pen deductions will trigger a repartitioning which in turn triggers the logic requeue.)
							self.deduction_queue.enqueue(candidate, 70)
							return True
					pass

				case GroupDeduction(partition=partition, type="partitions"):
					if not using_partitions: continue
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
						self.log_move({
							"group": partition.group.i,
							"numbers": list(guess_values),
							"antiNumbers": [ value for value in partition.values if value not in guess_values ],
							"couldBe": [ cell.i for cell in could_be ],
							"couldNotBe": [ cell.i for cell in partition if cell not in could_be ]
						}, verbose)
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
												self.log_move({
													"groups": [partition.group.i, overlap_group.i],
													"counterGroups": [a_partition.group.i, b_partition.group.i],
													"cells": [ a.i, b.i, overlap_a.i, overlap_b.i ],
													"pivotValue": value,
													"ruledOutFrom": [ cell.i for cell in ruled_out_from ]
												}, verbose)
												self.deduction_queue.enqueue(candidate)
												return True
											
				case GroupDeduction(partition=partition, type="swordfish"):
					if not using_swordfish: continue
					if len(partition) < 2: continue
					assert all( not cell.answer_known for cell in partition )
					# start by finding a start point
					for start in partition:
						for value in start.pencil:
							# check there'll be something to rule out
							could_be = [ cell for cell in partition if cell.could_be(value) ]
							if len(could_be) < 3: continue
							# now, step through the grid until we land back in `partition`.
							loops = list(self.find_loopbacks(partition.group, partition.group, value, [start]))
							if not loops: continue

							# take the shortest loop to be our "canonical" one
							loops.sort(key=lambda loop: len(loop))
							loop = loops[0]

							# so there are two types of loops: odd (1) and even (0)
							parity = len(loop) % 2
							
							# There used to be some asserts here - one that the parities were all the same, and one that the loops all ended in the same place. These aren't true - most notably, if the loops all end in different places, of course there's no reason the parities should match. It can be simultaneously true that one of A and B is a 2, but neither of A and C are a 2. One could write some asserts here that work, but they'd be a lot and there's no reason to think they'd ever fail, so I'm not going to do it unless a specific reason comes up.

							if parity == 0:
								# a traditional swordfish (which may be the only kind allowable in 2D) is even
								# which is to say that if one end of the chain is not a 4 (or whatever) then the other end must be
								# and therefore they form a pointer to other cells in the target group
								ruled_out_from = [ cell for cell in could_be if cell not in loop ]
								for cell in ruled_out_from:
									cell.rule_out(value)
								self.log_move({
									"group": partition.group.i,
									"chain": [ cell.i for cell in loop ],
									"value": value,
									"ruledOutFrom": [ cell.i for cell in ruled_out_from ],
									"parity": "even"
								}, verbose)
								self.deduction_queue.enqueue(candidate, 40)
								return True
							
							else:
								# an odd swordfish says that if one end of the chain is a 4 (or whatever) then SO MUST THE OTHER END BE
								# this is obviously nonsense so it must be wrong.
								# we can rule out the target value from both ends of the chain
								# we might be able to rule it out from all the odd steps, but i think it will propagate along the chain using simpler logic anyway
								loop[0].rule_out(value)
								loop[-1].rule_out(value)
								self.log_move({
									"group": partition.group.i,
									"chain": [ cell.i for cell in loop ],
									"value": value,
									"ruledOutFrom": [ loop[0].i, loop[-1].i ],
									"parity": "odd"
								}, verbose)
								self.deduction_queue.enqueue(candidate, 40)
								return True

				case _:
					print(candidate)
					raise Exception("Unexpected candidate")

	# this is only its own function so it can recurse,
	# if you got here other than by looking to see what loop_ends does,
	# you almost certainly don't need it
	def find_loopbacks(self, start_group, last_group, value, chain):
		current_cell = chain[-1]
		for group in current_cell.groups:
			if group is last_group: continue
			if group is start_group:
				yield chain
				continue
			could_be = [
				cell for cell in group.partition_for(current_cell)
				if cell.could_be(value) and cell is not current_cell
			]
			if len(could_be) != 1: continue
			[next_cell] = could_be
			if next_cell in chain: continue
			for end in self.find_loopbacks(start_group, group, value, chain + [next_cell]):
				yield end

def numlist(l):
	o = []
	for i in l:
		if type(i) == int:
			o.append(i)
		else:
			o.append(i.i)
	o.sort()
	return ",".join(str(i) for i in o)
