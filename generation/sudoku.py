import random

class Sudoku:
	def __init__(self, groups, cells, how_many):
		self.groups = groups
		self.cells = cells
		self.how_many = how_many
		self.moves = []
		self.checked_moves = set()
		self.n = len(self.groups[0])
		for i in range(len(self.cells)):
			self.cells[i].i = i
		# self.check()

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
	def try_generate(self, **kwargs):
		while True:
			if self.solve(**kwargs): return True
			if not self.add_random_clue(): return False

	# returns true on success and false on failure
	def add_random_clue(self):
		cell = random.choice(list(self.unsolved_cells()))
		if cell.pencil == 0: return False
		cell.make_clue()
		return True

	# returns true on success and false on failure
	def solve(self, **kwargs):
		while self.find_move(**kwargs):
			if self.is_solved():
				return True
		return False

	# returns true if it found a move, false otherwise
	def find_move(self, using_pointers=False):
		for cell in self.cells:
			# Don't check cells we've already solved
			if cell.answer_known: continue
			# Check to see if there's only one number allowed there
			for n in range(self.n):
				if cell.pencil == 1 << n:
					self.moves.append({
						"cell": cell.i,
						"canOnlyBe": n
					})
					cell.set_answer(n)
					return True
		# Check each group to see if there's only one place any given number can go
		for group in self.groups:
			for n in range(self.n):
				bit = 1 << n
				places = [cell for cell in group if cell.pencil & (1 << n)]
				if len(places) == 1 and not places[0].answer_known:
					self.moves.append({
						"cell": cell.i,
						"group": group.i,
						"onlyPlaceFor": n
					})
					places[0].set_answer(n)
					return True
		if not using_pointers: return False
		# Check to see if there are any pointers — eg, two numbers that have to go in two cells. This is the same thing as 14 cells that can only be 14 numbers, so these two deductions are the same and we only need to implement one. As it goes, the latter is the one coded up.
		for group in self.groups:
			candidates = [ cell for cell in group if not cell.answer_known ]
			id = f"{group.i}/{','.join([ str(cell.pencil) for cell in candidates ])}"
			if (id in self.checked_moves): continue
			self.checked_moves.add(id)
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
					cell.pencil &= bits
					if cell.answer != None and not cell.pencil & (1 << cell.answer):
						print(id, bits)
						raise Exception("Wrong pencil deductions!")
				return True
		return False

