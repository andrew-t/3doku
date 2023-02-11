#!/usr/bin/env python3

import random
import json
from uuid import uuid4 as uuid

from sudokube import Sudokube

def generate_easy_puzzle():
	while True:
		print(" - Generating candidate grid")
		cube = Sudokube()
		if cube.try_generate():
			return cube

# generate an easy puzzle as a quick way to fill the grid
print("Generating answer grid")
easy_puzzle = generate_easy_puzzle()
answers = easy_puzzle.answers()
print(answers)

intended_difficulty = {
	"using_pointers": True
}

# use the filled grid to ensure the real puzzle generation doesn't waste time on impossible guesses
print("Generating clues")
puzzle = Sudokube(answers=answers)
puzzle.try_generate(**intended_difficulty)
clues = puzzle.clues()
print(clues)

# try to remove as many clues as possible and see if it's still solvable
print("Pruning clues")
test = None
while True:
	print(" - Starting clue pruning loop")
	for clue in clues:
		print(f"   - Testing clue in cell {clue}")
		test_clues = [ c for c in clues if c != clue ]
		test = Sudokube(answers, test_clues)
		if test.solve(**intended_difficulty):
			print(f"     - Deleting clue in cell {clue}")
			clues = test_clues
			break
	else:
		# we didn't manage to remove any clues on the last iteration, so stop
		break

# now solve it just from the clues, so we know what kinds of logic it actually requires
print("Calculating solution")
solution = Sudokube(answers=answers, clues=clues)
solution.solve(**intended_difficulty)

puzzle_json = solution.to_json()
print(puzzle_json)
with open(f"candidates/{uuid()}.json", "w") as f:
	json.dump(puzzle_json, f)
