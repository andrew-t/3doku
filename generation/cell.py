import random

class Cell:
	def __init__(self, g1, g2, g3):
		self.groups = []
		self.put_into_group(g1)
		self.put_into_group(g2)
		self.put_into_group(g3)
		self.answer = None
		self.pencil = 65535
		self.is_clue = False
		self.answer_known = False

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
			raise Exception("Invalid answer set")
		if (self.answer != None and self.answer != n):
			raise Exception("Wrong answer set")
		self.answer = n
		self.mark_answer_known()

	def mark_answer_known(self):
		self.answer_known = True
		self.pencil = 1 << self.answer
		self.propagate()

	def propagate(self):
		for group in self.groups:
			for cell in group:
				if cell is self: continue
				cell.pencil &= ~self.pencil
