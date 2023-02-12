#!/usr/bin/env python3

import random
import json
from uuid import uuid4 as uuid

from sudokube import Sudokube

def generate_easy_puzzle():
	while True:
		# print(" - Generating candidate grid")
		cube = Sudokube()
		if cube.try_generate():
			return cube

def generate_puzzle(brute_force, **intended_difficulty):
	# generate an easy puzzle as a quick way to fill the grid
	print("Generating answer grid")
	easy_puzzle = generate_easy_puzzle()
	answers = easy_puzzle.answers()
	# print(answers)

	# use the filled grid to ensure the real puzzle generation doesn't waste time on impossible guesses
	print("Generating clues")
	puzzle = Sudokube(answers=answers)
	# don't use brute force here, it's too slow, use it when we're pruning clues, that's plenty, we don't want loads of brute force puzzles anyway
	puzzle.try_generate(brute_force=False, **intended_difficulty, easy_before=10)
	clues = puzzle.clues()
	# print(clues)

	# try to remove as many clues as possible and see if it's still solvable
	print("Pruning clues")
	for clue in clues:
		print(f"   - Testing clue in cell {clue}")
		test_clues = [ c for c in clues if c != clue ]
		test = Sudokube(answers, test_clues)
		if test.solve(brute_force=brute_force, **intended_difficulty):
			print(f"     - Deleting clue in cell {clue}")
			clues = test_clues

	# now solve it just from the clues, so we know what kinds of logic it actually requires
	print("Calculating solution")
	solution = Sudokube(answers=answers, clues=clues)
	solution.solve(brute_force=brute_force, **intended_difficulty)

	id = uuid()
	print(f"Saving solution as {id}")
	puzzle_json = solution.to_json()
	# print(puzzle_json)
	with open(f"generation/candidates/{id}.json", "w") as f:
		json.dump(puzzle_json, f)

	print(f"{len(clues)} clues")
	
	print("✅ Requires pointers"
		if any("numbers" in move for move in puzzle_json["moves"])
		else "No pointers")
	
	print("⚠️  Requires brute force"
		if any("puzzleInvalidIf" in move for move in puzzle_json["moves"])
		else "No brute force")

if __name__ == "__main__":
	while True:
		generate_puzzle(brute_force=2, using_pointers=True)
