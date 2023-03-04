from collections import namedtuple

GroupDeduction = namedtuple('GroupDeduction', ['partition', 'type'])

class GroupPartition:
	def __init__(self, group, cells, values=None):
		self.group = group
		self.exists = True
		self.grid = group.grid
		self.cells = set(cells)
		if values:
			self.values = set(values)
		else:
			self.values = set()
			for cell in cells:
				self.values |= cell.pencil

	def __iter__(self):
		for cell in self.cells:
			yield cell

	def __len__(self):
		return len(self.cells)

	def __contains__(self, n):
		return n in self.cells

	def enqueue_partition(self):
		assert self.exists
		self.grid.deduction_queue.enqueue(GroupDeduction(self, 'partition'), 200)
		return

	def enqueue_logic(self):
		if len(self.cells) == 1: return
		# if you change these priorities, make sure to change them in sudoku.py too
		self.grid.deduction_queue.enqueue(GroupDeduction(self, 'only_place'), 90)
		self.grid.deduction_queue.enqueue(GroupDeduction(self, 'partitions'), 80)
		self.grid.deduction_queue.enqueue(GroupDeduction(self, 'pointers'), 70)
		self.grid.deduction_queue.enqueue(GroupDeduction(self, 'x_wing'), 50)
		self.grid.deduction_queue.enqueue(GroupDeduction(self, 'swordfish'), 40)

	def partition(self):
		partitions = []
		for cell in self.cells:
			# if cell.answer_known: continue
			cell_partition = GroupPartition(self.group, [cell], list(cell.pencil))
			for partition in [x for x in partitions]:
				if not partition.values.isdisjoint(cell_partition.values):
					cell_partition.cells |= partition.cells
					cell_partition.values |= partition.values
					partitions.remove(partition)
			partitions.append(cell_partition)
		return partitions if partitions[0].cells != self.cells else False

class Group:
	def __init__(self, i):
		self.cells = set()
		self.i = i

	def add_cell(self, cell):
		self.cells.add(cell)

	def freeze(self, grid):
		self.grid = grid
		self.cells = frozenset(self.cells)
		self.partitions = [GroupPartition(self, self.cells)]

	def __iter__(self):
		for cell in self.cells:
			yield cell

	def __len__(self):
		return len(self.cells)

	def __contains__(self, n):
		return n in self.cells

	def intersection(self, other):
		return self.cells.intersection(other.cells)

	def is_disjoint(self, other):
		return self.cells.is_disjoint(other.cells)

	def not_in(self, other):
		return self.cells.difference(other.cells)

	def partition_for(self, cell):
		assert cell in self
		assert not cell.answer_known
		for partition in self.partitions:
			if cell in partition:
				return partition
		raise Exception("Wrong group")
