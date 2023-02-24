import random

class Cell:
	def __init__(self, groups, n):
		self.groups = []
		self.n = n
		for group in groups:
			self.put_into_group(group)
		self.answer = None
		self.pencil = set(range(n))
		self.is_clue = False
		self.answer_known = False
		self.grid = None

	def clone(self, new_groups, no_answers=False):
		cosima = Cell([new_groups[group.i] for group in self.groups])
		cosima.pencil = set(self.pencil)
		if self.answer_known or not no_answers:
			cosima.answer = self.answer
			cosima.answer_known = self.answer_known
		cosima.is_clue = self.is_clue
		return cosima

	def put_into_group(self, group):
		self.groups.append(group)
		group.add_cell(self)

	def could_be(self, n):
		return n in self.pencil

	def make_clue(self):
		assert not self.is_clue
		assert not self.answer_known
		if self.answer == None:
			self.set_answer(random.choice(list(self.pencil)))
		else:
			self.mark_answer_known()
		self.is_clue = True

	def rule_out(self, value):
		assert self.answer != value
		if not value in self.pencil:
			return
		self.pencil.remove(value)
		self.enqueue()

	def enqueue(self):
		self.grid.deduction_queue.enqueue(self, 100)
		for group in self.groups:
			group.partition_for(self).enqueue_partition()

	# this is for during solving, it marks the answer as known
	def set_answer(self, n):
		assert n in self.pencil
		assert self.answer is None or self.answer is n
		self.answer = n
		self.mark_answer_known()

	def mark_answer_known(self):
		assert not self.answer_known
		self.pencil = set([self.answer])
		for group in self.groups:
			partition = group.partition_for(self)
			for cell in partition:
				if cell is self: continue
				cell.rule_out(self.answer)
			partition.enqueue_partition()
		self.answer_known = True
