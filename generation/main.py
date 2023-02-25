#!/usr/bin/env python3

import random
import json
from uuid import uuid4 as uuid
from datetime import datetime
from sys import stdout

from sudokube import Sudokube

def log_line(line):
	print("")
	print(f"\033[1;36m{datetime.now()}\033[0m", line, end="")
	stdout.flush()

def log_append(part):
	print(part, end="")
	stdout.flush()

def move_type(move):
	if "canOnlyBe" in move: return "cell-can-only-be"
	if "onlyPlaceFor" in move: return "the-N-must-go-here"
	if "couldBe" in move: return "🗃️  partitions"
	if "pointingValue" in move: return "👉 pointers"
	if "pivotValue" in move: return "🚀 x-wings"
	if "chain" in move: return f"🐟 {move['parity']} swordfish"
	if "randomlyAssigned" in move: return "⚠️ guesswork"
	return str(move)

def generate_easy_puzzle():
	while True:
		# log_line(" - Generating candidate grid")
		cube = Sudokube()
		if cube.try_generate():
			return cube

def grid_line(pad, grid, faces, clues_only=False):
	for row in range(4):
		print(" " * (pad + 2), end="")
		for face in faces:
			for x in range(4):
				cell = grid.cells[face * 16 + row * 4 + x]
				print(hex(cell.answer)[2] if cell.is_clue or not clues_only else "-", end="")
		print("")

def print_grid(grid):
	log_line("Printing grid:")
	print("")
	grid_line(0, grid, [2])
	grid_line(0, grid, [0, 4, 1, 5])
	grid_line(8, grid, [3])

def check_grid(grid):
	for group in grid.groups:
		# assert { cell.answer for cell in group } == { i for i in range(16) }
		if { cell.answer for cell in group } != { i for i in range(16) }:
			print([ cell.i for cell in group ])
			print({ cell.answer for cell in group })
			print({ i for i in range(16) })
			raise Exception("check failed")

def generate_puzzle(**intended_difficulty):
	# generate an easy puzzle as a quick way to fill the grid
	log_line("Generating answer grid")
	easy_puzzle = generate_easy_puzzle()
	print_grid(easy_puzzle)
	check_grid(easy_puzzle)
	answers = easy_puzzle.answers()
	# log_line(answers)

	# use the filled grid to ensure the real puzzle generation doesn't waste time on impossible guesses
	log_line("Generating clues")
	puzzle = Sudokube(answers=answers)
	# don't use brute force here, it's too slow, use it when we're pruning clues, that's plenty, we don't want loads of brute force puzzles anyway
	puzzle.try_generate(**intended_difficulty)
	clues = puzzle.clues()
	# log_line(clues)

	# try to remove as many clues as possible and see if it's still solvable
	log_line("Pruning clues")
	log_line(" - ")
	shuffled = list(clues)
	random.shuffle(shuffled)
	for clue in shuffled:
		log_append(clue)
		test_clues = [ c for c in clues if c != clue ]
		test = Sudokube(answers, test_clues)
		if test.solve(**intended_difficulty):
			log_append(" deleted, ")
			clues = test_clues
		else:
			log_append(" kept, ")
	log_append("done")

	# now solve it just from the clues, so we know what kinds of logic it actually requires
	log_line("Calculating solution")
	solution = Sudokube(answers=answers, clues=clues)
	solution.solve(**intended_difficulty)

	id = uuid()
	log_line(f"Saving solution as {id}")
	puzzle_json = solution.to_json()
	# log_line(puzzle_json)
	with open(f"generation/candidates/{id}.json", "w") as f:
		json.dump(puzzle_json, f)

	log_line(f"{len(clues)} clues")
	
	log_line(f"Requires: {', '.join(set( move_type(move) for move in solution.moves ))}")

if __name__ == "__main__":
	while True:
		generate_puzzle(
			using_pointers=True,
			using_partitions=True,
			# It is my current belief that X-wings cannot exist on a cube.
			# The four cells cannot be in four different subgrids (faces) because the geometry forbids it
			# and if they're squeezed into two adjacent faces then what you've got is just two pointers.
			using_x_wings=False,
			using_swordfish=True
		)
