#!/usr/bin/env python3

import random
import json

from sudokube import Sudokube

# TODO: generate a grid of answers first and then use it to generate clues, the theory being that always guessing valid clues should allow hard puzzles to be generated without too many reboots. my guess is we'll get mostly easy ones but i can easily pull out the hard ones

def generate_puzzle(answers=None, **kwargs):
	iterations = 0
	while True:
		iterations += 1
		print(f"Generating puzzle... {iterations}")
		cube = Sudokube(answers=answers)
		if cube.try_generate(**kwargs):
			print(f"generated valid puzzle in {iterations} tries")
			return cube

easy_puzzle = generate_puzzle()
potted_answers = easy_puzzle.answers()
puzzle = generate_puzzle(
	answers=potted_answers,
	use_pointers_after=10
)

puzzle_json = puzzle.to_json()
print(puzzle_json)
with open("puzzle.json", "w") as f:
	json.dump(puzzle_json, f)
