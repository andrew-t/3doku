class Group:
	def __init__(self, i):
		self.cells = set()
		self.i = i

	def __len__(self):
		return len(self.cells)

	def add_cell(self, cell):
		self.cells.add(cell)

	def freeze(self):
		self.cells = frozenset(self.cells)

	def __iter__(self):
		for cell in self.cells:
			yield cell

	def intersection(self, other):
		return self.cells.intersection(other.cells)

	def is_disjoint(self, other):
		return self.cells.is_disjoint(other.cells)

	def not_in(self, other):
		return self.cells.difference(other.cells)
