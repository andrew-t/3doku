import random

from cell import Cell
from group import Group, GroupDeduction
from queue import PrioritisedQueue

class Sudoku:
	def __init__(self, groups, cells, how_many):
		self.groups = groups
		self.cells = cells
		self.how_many = how_many
		self.moves = []
		self.n = len(self.groups[0])
		self.deduction_queue = PrioritisedQueue()
		for group in self.groups:
			group.grid = self
			group.freeze()
		for i in range(len(self.cells)):
			self.cells[i].i = i
			self.cells[i].grid = self
		# self.check()

	def clone(self, no_answers=False):
		new_groups = [Group(group.i) for group in self.groups]
		new_cells = [cell.clone(new_groups, no_answers) for cell in self.cells]
		cosima = Sudoku(new_groups, new_cells, self.how_many)
		cosima.moves = [m for m in self.moves]
		cosima.checked_moves = set(self.checked_moves)
		return cosima

	def check(self):
		for group in self.groups:
			if len(group) != self.n:
				raise Exception("bad groups")

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
	def try_generate(self, easy_before=10, **kwargs):
		guesses = 0
		while True:
			if self.solve(**(kwargs if guesses >= easy_before else {})): return True
			if not self.add_random_clue(): return False
			guesses += 1

	# returns true on success and false on failure
	def add_random_clue(self):
		cell = random.choice(list(self.unsolved_cells()))
		if cell.pencil == 0: return False
		cell.make_clue()
		return True

	# returns true on success and false on failure
	# returns NONE when the puzzle is invalid
	def solve(self, **kwargs):
		if not self.deduction_queue:
			for cell in self.cells:
				self.deduction_queue.append(cell)
			for group in self.groups:
				self.deduction_queue.append(group)
		while True:
			result = self.find_move(**kwargs)
			if result is None: return None
			if not result: return False
			if self.is_solved(): return True

	# returns true if it found a move, false otherwise
	# returns NONE when the puzzle is invalid
	def find_move(self, using_pointers=False):
		while self.deduction_queue.has_items():
			candidate = self.deduction_queue.pop()
			match candidate:

				case Cell():
					# there's only one deduction we can do on a cell, and it's pretty easy
					if self.how_many[candidate.pencil] == 1 and not candidate.answer_known:
						for n in range(self.n):
							if candidate.pencil == (1 << n):
								candidate.set_answer(n)
								self.moves.append({
									"cell": candidate.i,
									"canOnlyBe": n
								})
						return True

				case GroupDeduction(group=group, type="only_place"):
					for n in range(self.n):
						bits = 1 << n
						places = [cell for cell in group if cell.pencil & bits]
						if len(places) == 1 and not places[0].answer_known:
							self.moves.append({
								"cell": places[0].i,
								"group": group.i,
								"onlyPlaceFor": n
							})
							places[0].set_answer(n)
							return True

				case GroupDeduction(group=group, type="pointers"):
					if not using_pointers:
						continue
					candidates = [ cell for cell in group if not cell.answer_known ]
					numbers_we_know = 0
					for cell in group:
						if cell.answer_known:
							numbers_we_know |= (1 << cell.answer)
					# exclude 0 and 65535 because they're trivial cases; they are always true and never useful
					for bits in range(1, 65535):
						n = self.how_many[bits]
						# we can also exclude all the cases with 1 or 15 bits because those are equivalent to the basic logic above, which is faster than checking all this
						if n == 1 or n == 15: continue
						# the set of numbers we consider isn't allowed to contain numbers we've already placed; that would be pointless and also cause bugs
						if numbers_we_know & bits: continue
						# Find all the cells which can contain any of the numbers we're considering, even if they could contain other things too.
						could_be = [ cell for cell in candidates if cell.pencil & bits ]
						could_be_n = len(could_be)
						# We only care about the case where N numbers are locked to N cells — so we know those cells can't be anything else.
						if could_be_n == len(candidates) or could_be_n != n: continue
						# ok so this means there are (say) 3 numbers that can only possibly be in the same 3 cells in this group
						self.moves.append({
							"group": group.i,
							"numbers": [ i for i in range(self.n) if bits & (1 << i) ],
							"couldBe": [ cell.i for cell in could_be ],
							# "bits": bits
							# "n": could_be_n
						})
						# therefore, the cells that COULD be the numbers we're considering can't be anything BUT those numbers — otherwise there wouldn't be space for them.
						for cell in could_be:
							cell.set_pencil(cell.pencil & bits)
						return True

				case GroupDeduction(group=group, type="x_wing"):
					pass

				case _:
					print(candidate)
					raise Exception("Unexpected candidate")
