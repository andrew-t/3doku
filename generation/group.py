class Group:
	def __init__(self, i):
		self.cells = []
		self.i = i

	def __len__(self):
		return len(self.cells)

	def append(self, cell):
		self.cells.append(cell)

	def __iter__(self):
		for cell in self.cells:
			yield cell
