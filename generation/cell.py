import random

class Cell:
	def __init__(self, groups):
		self.groups = []
		for group in groups:
			self.put_into_group(group)
		self.answer = None
		self.pencil = 65535
		self.is_clue = False
		self.answer_known = False
		self.grid = None

	def clone(self, new_groups, no_answers=False):
		cosima = Cell([new_groups[group.i] for group in self.groups])
		cosima.pencil = self.pencil
		if self.answer_known or not no_answers:
			cosima.answer = self.answer
			cosima.answer_known = self.answer_known
		cosima.is_clue = self.is_clue
		return cosima

	def put_into_group(self, group):
		self.groups.append(group)
		group.append(self)

	def make_clue(self):
		if self.answer == None:
			self.set_answer(random.choice([
				n for n in range(16) if self.pencil & (1 << n)
			]))
		else:
			self.mark_answer_known()
		self.is_clue = True

	# this is for during solving, it marks the answer as known
	def set_answer(self, n):
		if not (self.pencil & (1 << n)):
			print(self.grid.moves, self.answer, self.pencil)
			raise Exception("Invalid answer set")
		if self.answer != None and self.answer != n:
			print(self.grid.moves, self.answer)
			raise Exception("Wrong answer set")
		self.answer = n
		self.mark_answer_known()

	def mark_answer_known(self):
		self.answer_known = True
		self.pencil = 1 << self.answer
		for group in self.groups:
			for cell in group:
				if cell is self: continue
				cell.pencil &= ~self.pencil
