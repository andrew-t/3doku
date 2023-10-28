#!/usr/bin/env python3

from accept import build_week, print_level
from main import generate_puzzle
from random import randint
import json

easy = {
	"using_pointers": False,
	"using_partitions": False,
	"using_x_wings": False,
	"using_swordfish": False,
}
medium = {
	"using_pointers": True,
	"using_partitions": False,
	"using_x_wings": False,
	"using_swordfish": False,
}
hard = {
	"using_pointers": True,
	"using_partitions": True,
	"using_x_wings": False,
	"using_swordfish": True,
}

while True:

	# Accept as many potted puzzles as we can:
	puzzles = [True]
	while all(puzzles):
		(puzzles, id) = build_week()
		if all(puzzles):
			difficulties = []
			print("Current puzzles:")
			for puzzle_id in range(1, id + 1):
				with open(f"puzzles/{puzzle_id}.json", "r") as f:
					puzzle = json.load(f)
				difficulties.append(puzzle["difficulty"])
				print(f" - #{puzzle_id}: {print_level(puzzle)}")
			with open(f"puzzles/difficulties.json", "w") as f:
				json.dump(difficulties, f)
		
	# We're now low on puzzles, so generate some new ones. But what level???

	# if only hard/wildcard puzzles can't be found, generate some puzzles where anything goes
	if all(puzzles[:4]):
		print("going for a hard one")
		generate_puzzle(
			using_pointers = True,
			using_partitions = True,
			using_x_wings = False,
			using_swordfish = True
		)

	# if only easy puzzles can't be found, generate some easy puzzles
	elif all(puzzles[2:]):
		print("going for an easy one")
		generate_puzzle(
			using_pointers = randint(0, 5) > 2,
			using_partitions = False,
			using_x_wings = False,
			using_swordfish = False
		)

	# if only easy/medium puzzles can't be found, generate some puzzles that aren't *too* hard
	elif all(puzzles[5:]):
		print("going for a medium one")
		generate_puzzle(
			using_pointers = True,
			using_partitions = True,
			using_x_wings = False,
			using_swordfish = False
		)

	# Otherwise, just generate any puzzle you can.
	else:
		print("going for anything")
		generate_puzzle(
			using_pointers = True,
			using_partitions = True,
			using_x_wings = False,
			using_swordfish = True
		)

	print("")
	


