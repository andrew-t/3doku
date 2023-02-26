#!/usr/bin/env python3

import json
import os
import random

def calculate_difficulty(puzzle):
	level = [0, 0, 0, [], []]
	for move in puzzle["moves"]:
		match move:
			case { "canOnlyBe": _ }:
				level[0] += 1
			case { "onlyPlaceFor": _ }:
				level[1] += 1
			case { "pointingGroup": _ }:
				level[2] += 1
			case { "couldBe": couldBe, "couldNotBe": couldNotBe }:
				level[3].append(min(len(couldBe), len(couldNotBe)))
			case { "chain": chain }:
				level[4].append(len(chain))
			case _:
				print(move)
				raise Exception("Unexpected move type")
	match level:
		case [_, 0, 0, [], []]:
			return 100
		case [_, _, 0, [], []]:
			return 200
		case [_, _, _, [], []]:
			return 300
		case [_, _, _, partitions, []] if max(partitions) < 3:
			return 400
		case [_, _, _, _, []]:
			return 500
		case [_, _, _, _, swordfish] if max(swordfish) < 5:
			return 600
		case [_, _, _, _, _]:
			return 700
		case _:
			print(level)
			raise Exception("Unexpected level")
		
def print_level(puzzle):
	d = puzzle["difficulty"]
	if d <= 100: return "\033[1;47mInsultingly easy\033[0m"
	if d <= 200: return "\033[1;42mVery easy\033[0m"
	if d <= 300: return "\033[42mEasy\033[0m"
	if d <= 400: return "\033[44mMedium\033[0m"
	if d <= 500: return "\033[43mTricky\033[0m"
	if d <= 600: return "\033[41mHard\033[0m"
	return "\033[1;41mFiendish\033[0m"

weekly_curve = [
	(100, 300), # nice gentle puzzle on monday
	(300, 400), # tuesday might be a little taxing but not hard
	(400, 500), # wednesday won't be trivial but won't be hard either
	(500, 600), # thursday has *big* partitions or small swordfish
	(600, 700), # friday always has swordfish, sometimes big ones
	(700, 700), # saturday always has big swordfish, utter bastards
	(400, 700), # sunday is a wildcard, but nothing trivial
]

def build_week():
	# Where had we got up to?
	puzzle_id = max([
		int(fn[:-5])
		for fn in os.listdir('puzzles')
		if fn[-5:] == ".json"
	] or [0])
	# This should usually be zero but just in case...
	week_start = puzzle_id % 7
	# Find puzzles with the requisite levels
	files = [ fn[:36] for fn in os.listdir('generation/candidates') if len(fn) == 41 ]
	random.shuffle(files)
	puzzles = [None] * 7
	for uuid in files:
		with open(f"generation/candidates/{uuid}.json", "r") as f:
			try:
				puzzle = json.load(f)
			except Exception as e:
				print(uuid)
				raise e
		try:
			difficulty = calculate_difficulty(puzzle)
		except Exception as e:
			print(uuid)
			raise e
		for day in range(week_start, 7):
			if puzzles[day]: continue
			(min_difficulty, max_difficulty) = weekly_curve[day]
			if min_difficulty <= difficulty <= max_difficulty:
				puzzle["difficulty"] = difficulty
				puzzles[day] = (uuid, puzzle)
				break
	if not all(puzzles[i] for i in range(week_start, 7)):
		print("Couldn't find another week of puzzles in the bank")
		print(["Found" if p else "Not found" for p in puzzles])
		return (False, puzzle_id)
	# Put those puzzles in the rotation, and remove them so we don't use them again
	for (uuid, puzzle) in puzzles:
		if not puzzle: continue
		puzzle_id += 1
		os.remove(f"generation/candidates/{uuid}.json")
		with open(f"puzzles/{puzzle_id}.json", "w") as f:
			json.dump(puzzle, f)
	print(f"Accepted a week of puzzles, now up to {id}")
	return (True, puzzle_id)

if __name__ == "__main__":
	result = True
	while result:
		(result, id) = build_week()

	print("Current puzzles:")
	for puzzle_id in range(1, id + 1):
		with open(f"puzzles/{puzzle_id}.json", "r") as f:
			puzzle = json.load(f)
		print(f" - #{puzzle_id}: {print_level(puzzle)}")
