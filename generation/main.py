import random
import json

# don't bother generating the grid, we did that in js and here is the result:

all_groups = []

class Group:
	def __init__(self):
		self.cells = []
	def __len__(self):
		return len(self.cells)
	def append(self, cell):
		self.cells.append(cell)
	def __iter__(self):
		for cell in self.cells:
			yield cell

for i in range(18):
	g = Group()
	g.i = i
	all_groups.append(g)

class Cell:
	def __init__(self, g1, g2, g3):
		self.groups = []
		self.put_into_group(g1)
		self.put_into_group(g2)
		self.put_into_group(g3)

	def put_into_group(self, g):
		group = all_groups[g]
		self.groups.append(group)
		group.append(self)

	def wipe(self):
		self.answer = None
		self.pencil = 65535
		self.is_clue = False

	def make_clue(self):
		self.set_answer(random_one_of([
			n for n in range(16) if self.pencil & (1 << n)
		]))
		self.is_clue = True

	def set_answer(self, n):
		bit = 1 << n
		if not (self.pencil & bit):
			raise Exception("Invalid answer set")
		self.answer = n
		self.pencil = bit
		self.propagate()

	def propagate(self):
		for group in self.groups:
			for cell in group:
				if cell is self: continue
				cell.pencil &= ~self.pencil

cells = [Cell(12,0,4),Cell(12,0,5),Cell(12,0,6),Cell(12,0,7),Cell(12,1,4),Cell(12,1,5),Cell(12,1,6),Cell(12,1,7),Cell(12,2,4),Cell(12,2,5),Cell(12,2,6),Cell(12,2,7),Cell(12,3,4),Cell(12,3,5),Cell(12,3,6),Cell(12,3,7),Cell(13,0,7),Cell(13,0,6),Cell(13,0,5),Cell(13,0,4),Cell(13,1,7),Cell(13,1,6),Cell(13,1,5),Cell(13,1,4),Cell(13,2,7),Cell(13,2,6),Cell(13,2,5),Cell(13,2,4),Cell(13,3,7),Cell(13,3,6),Cell(13,3,5),Cell(13,3,4),Cell(14,8,4),Cell(14,8,5),Cell(14,8,6),Cell(14,8,7),Cell(14,9,4),Cell(14,9,5),Cell(14,9,6),Cell(14,9,7),Cell(14,10,4),Cell(14,10,5),Cell(14,10,6),Cell(14,10,7),Cell(14,11,4),Cell(14,11,5),Cell(14,11,6),Cell(14,11,7),Cell(15,8,7),Cell(15,8,6),Cell(15,8,5),Cell(15,8,4),Cell(15,9,7),Cell(15,9,6),Cell(15,9,5),Cell(15,9,4),Cell(15,10,7),Cell(15,10,6),Cell(15,10,5),Cell(15,10,4),Cell(15,11,7),Cell(15,11,6),Cell(15,11,5),Cell(15,11,4),Cell(16,0,11),Cell(16,0,10),Cell(16,0,9),Cell(16,0,8),Cell(16,1,11),Cell(16,1,10),Cell(16,1,9),Cell(16,1,8),Cell(16,2,11),Cell(16,2,10),Cell(16,2,9),Cell(16,2,8),Cell(16,3,11),Cell(16,3,10),Cell(16,3,9),Cell(16,3,8),Cell(17,0,8),Cell(17,0,9),Cell(17,0,10),Cell(17,0,11),Cell(17,1,8),Cell(17,1,9),Cell(17,1,10),Cell(17,1,11),Cell(17,2,8),Cell(17,2,9),Cell(17,2,10),Cell(17,2,11),Cell(17,3,8),Cell(17,3,9),Cell(17,3,10),Cell(17,3,11)]
for i in range(len(cells)):
	cells[i].i = i

for group in all_groups:
	if len(group) != 16:
		raise Exception("bad groups")

moves = []

def generate_puzzle():
	iterations = 0
	while True:
		iterations += 1
		print(f"Generating puzzle... {iterations}")
		ok = try_generate_puzzle()
		if ok:
			print(f"generated valid puzzle in {iterations} tries")
			return ok

def try_generate_puzzle():
	guesses = 0
	moves = []
	for cell in cells: cell.wipe()
	while True:
		# print("adding a random guess")
		guesses += 1
		unsolved = [ cell for cell in cells if cell.answer == None ]
		# print(f"{len(unsolved)} unsolved cells")
		if not unsolved:
			# hey we made a puzzle
			return True
		cell = random_one_of(unsolved)
		if cell.pencil == 0:
			print(f"cell has no options after {guesses} guesses and {len(moves)} deductions")
			return False
		cell.make_clue()
		while True:
			(cell, value) = find_move()
			if not cell: break
			# print(f'found move {cell} {value}')
			cell.set_answer(value)

def log_move(move):
	print(move)
	moves.append(move)

def find_move():
	# print("finding a move...")
	for cell in cells:
		if cell.answer is not None:
			continue
		for n in range(16):
			if cell.pencil == 1 << n:
				log_move({
					"cell": cell.i,
					"canOnlyBe": n
				})
				return cell, n
	for group in all_groups:
		for n in range(16):
			bit = 1 << n
			places = [
				cell for cell in group if cell.pencil & (1 << n)
			]
			if len(places) == 1 and places[0].answer is None:
				log_move({
					"cell": cell.i,
					"group": group.i,
					"onlyPlaceFor": n
				})
				return places[0], n
	# TODO: cleverer things
	return False, False

def random_one_of(arr):
	return arr[random.randint(0, len(arr) - 1)]

puzzle = generate_puzzle()

puzzle_json = {
	"answers": [ cell.answer for cell in cells ],
	"clues": [ cell.i for cell in cells if cell.is_clue ],
	"moves": moves
}

print(puzzle_json)

with open("puzzle.json", "w") as f:
	json.dump(puzzle_json, f)
