import random
import json

all_groups = []

# cache the numbers of bits in bitfields
how_many = []
for i in range(1 << 16):
	n = 0
	for j in range(16):
		if i & (1 << j): n += 1
	how_many.append(n)

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

# don't bother generating the grid, we did that in js and here is the result:
cells = [Cell(12,0,4),Cell(12,0,5),Cell(12,0,6),Cell(12,0,7),Cell(12,1,4),Cell(12,1,5),Cell(12,1,6),Cell(12,1,7),Cell(12,2,4),Cell(12,2,5),Cell(12,2,6),Cell(12,2,7),Cell(12,3,4),Cell(12,3,5),Cell(12,3,6),Cell(12,3,7),Cell(13,0,7),Cell(13,0,6),Cell(13,0,5),Cell(13,0,4),Cell(13,1,7),Cell(13,1,6),Cell(13,1,5),Cell(13,1,4),Cell(13,2,7),Cell(13,2,6),Cell(13,2,5),Cell(13,2,4),Cell(13,3,7),Cell(13,3,6),Cell(13,3,5),Cell(13,3,4),Cell(14,8,4),Cell(14,8,5),Cell(14,8,6),Cell(14,8,7),Cell(14,9,4),Cell(14,9,5),Cell(14,9,6),Cell(14,9,7),Cell(14,10,4),Cell(14,10,5),Cell(14,10,6),Cell(14,10,7),Cell(14,11,4),Cell(14,11,5),Cell(14,11,6),Cell(14,11,7),Cell(15,8,7),Cell(15,8,6),Cell(15,8,5),Cell(15,8,4),Cell(15,9,7),Cell(15,9,6),Cell(15,9,5),Cell(15,9,4),Cell(15,10,7),Cell(15,10,6),Cell(15,10,5),Cell(15,10,4),Cell(15,11,7),Cell(15,11,6),Cell(15,11,5),Cell(15,11,4),Cell(16,0,11),Cell(16,0,10),Cell(16,0,9),Cell(16,0,8),Cell(16,1,11),Cell(16,1,10),Cell(16,1,9),Cell(16,1,8),Cell(16,2,11),Cell(16,2,10),Cell(16,2,9),Cell(16,2,8),Cell(16,3,11),Cell(16,3,10),Cell(16,3,9),Cell(16,3,8),Cell(17,0,8),Cell(17,0,9),Cell(17,0,10),Cell(17,0,11),Cell(17,1,8),Cell(17,1,9),Cell(17,1,10),Cell(17,1,11),Cell(17,2,8),Cell(17,2,9),Cell(17,2,10),Cell(17,2,11),Cell(17,3,8),Cell(17,3,9),Cell(17,3,10),Cell(17,3,11)]
for i in range(len(cells)):
	cells[i].i = i

for group in all_groups:
	if len(group) != 16:
		raise Exception("bad groups")

moves = []
checked_moves = set()

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
	pre_guesses = 10
	guesses = 0
	moves = []
	checked_moves = set()
	for cell in cells: cell.wipe()
	while True:
		# print("adding a random guess")
		guesses += 1
		pre_guesses -= 1
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
			result = find_move(pre_guesses < 0)
			if result == False: break
			if result == None: return False

def log_move(move):
	print(move)
	moves.append(move)

def find_move(advanced):
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
				cell.set_answer(n)
				return True
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
				places[0].set_answer(n)
				return True
	if not advanced:
		return False
	print('checking groups')
	for group in all_groups:
		candidates = [ cell for cell in group if cell.answer == None ]
		id = f"{group.i}/{','.join([ str(cell.pencil) for cell in candidates ])}"
		if (id in checked_moves): continue
		checked_moves.add(id)
		# exclude 0 and 65535 because they're trivial cases
		for bits in range(1, 65535):
			n = how_many[bits]
			if n == 1 or n == 15: continue
			could_be = [ cell for cell in candidates if cell.pencil & bits ]
			could_be_n = len(could_be)
			# if could_be_n < n: return None
			if could_be_n == len(candidates) or could_be_n != n: continue
			# ok so this means there are (say) 3 numbers that can only possibly be in the same 3 cells in this group, so therefore the rest of the group can't be them
			log_move({
				"group": group.i,
				"numbers": [ i for i in range(16) if bits & (1 << i) ]
				# "n": could_be_n
			})
			for cell in group:
				if not cell in could_be:
					cell.pencil &= ~bits
			return True
	return False

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
