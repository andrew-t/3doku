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
		return ( cell for cell in self.cells if cell.answer == None )

	def is_solved(self):
		return not any(self.unsolved_cells())

	# returns true on success and false on failure
	def try_generate(self, use_pointers_after=False):
		guesses = 0
		while True:
			if self.solve(
				using_pointers=use_pointers_after
					and guesses >= use_pointers_after
			):
				return True
			guesses += 1
			if not self.add_random_clue(): return False

	# returns true on success and false on failure
	def add_random_clue(self):
		cell = random.choice(list(self.unsolved_cells()))
		if cell.pencil == 0: return False
		cell.make_clue()
		return True

	# returns true on success and false on failure
	def solve(self, using_pointers=True):
		while self.find_move(using_pointers):
			if self.is_solved():
				return True
		return False

	# returns true if it found a move, false otherwise
	def find_move(self, using_pointers=True):
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
		# Check to see if there are any pointers — eg, two numbers that have to go in two cells. This is the same thing as 14 cells that can only be 14 numbers, so these two deductions are the same and we only need to implement one. I forget which I did.
		for group in self.groups:
			candidates = [ cell for cell in group if not cell.answer_known ]
			id = f"{group.i}/{','.join([ str(cell.pencil) for cell in candidates ])}"
			if (id in self.checked_moves): continue
			self.checked_moves.add(id)
			# exclude 0 and 65535 because they're trivial cases; they are always true and never useful
			for bits in range(1, 65535):
				n = self.how_many[bits]
				# we can also exclude all the cases with 1 or 15 bits because those are equivalent to the basic logic above, which is faster than checking all this
				if n == 1 or n == 15: continue
				could_be = [ cell for cell in candidates if cell.pencil & bits ]
				could_be_n = len(could_be)
				# if could_be_n < n: return None
				if could_be_n == len(candidates) or could_be_n != n: continue
				# ok so this means there are (say) 3 numbers that can only possibly be in the same 3 cells in this group, so therefore the rest of the group can't be them
				self.moves.append({
					"group": group.i,
					"numbers": [ i for i in range(self.n) if bits & (1 << i) ]
					# "n": could_be_n
				})
				for cell in group:
					if not cell in could_be:
						cell.pencil &= ~bits
				return True
		return False

