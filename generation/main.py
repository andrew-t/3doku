#!/usr/bin/env python3

import random
import json
from uuid import uuid4 as uuid
from datetime import datetime
from sys import stdout

from sudokube import Sudokube

def log_line(line):
	print("")
	print(datetime.now(), line, end="")
	stdout.flush()

def log_append(part):
	print(part, end="")
	stdout.flush()

def generate_easy_puzzle():
	while True:
		# log_line(" - Generating candidate grid")
		cube = Sudokube()
		if cube.try_generate():
			return cube

def generate_puzzle(**intended_difficulty):
	# generate an easy puzzle as a quick way to fill the grid
	log_line("Generating answer grid")
	easy_puzzle = generate_easy_puzzle()
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
	
	log_line("✅ Requires pointers"
		if any("numbers" in move for move in puzzle_json["moves"])
		else "No pointers")
	
	log_line("⚠️  Requires brute force"
		if any("puzzleInvalidIf" in move for move in puzzle_json["moves"])
		else "No brute force")

if __name__ == "__main__":
	while True:
		generate_puzzle(using_pointers=True)
