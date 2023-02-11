import random

class Cell:
	def __init__(self, g1, g2, g3):
		self.groups = []
		self.put_into_group(g1)
		self.put_into_group(g2)
		self.put_into_group(g3)
		self.wipe()
		self.answer_known = False

	def put_into_group(self, group):
		self.groups.append(group)
		group.append(self)

	def wipe(self):
		self.answer = None
		self.pencil = 65535
		self.is_clue = False

	def make_clue(self):
		if self.answer == None:
			self.set_answer(random.choice([
				n for n in range(16) if self.pencil & (1 << n)
			]))
		self.answer_known = True
		self.is_clue = True

	# this is for during solving, it marks the answer as known
	def set_answer(self, n):
		bit = 1 << n
		if not (self.pencil & bit):
			raise Exception("Invalid answer set")
		if (self.answer != None and self.answer != n):
			raise Exception("Wrong answer set")
		self.answer = n
		self.answer_known = True
		self.pencil = bit
		self.propagate()

	def propagate(self):
		for group in self.groups:
			for cell in group:
				if cell is self: continue
				cell.pencil &= ~self.pencil
