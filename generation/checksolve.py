#!/usr/bin/env python3

import sys
import json

from sudokube import Sudokube

with open(sys.argv[1]) as f:
    puzzle = json.load(f)

cube = Sudokube(puzzle["answers"], puzzle["clues"])

cube.solve(
    using_pointers=True,
    using_partitions=True,
    # It is my current belief that X-wings cannot exist on a cube.
    using_x_wings=False,
    using_swordfish=True,
    verbose=True
)
print(cube.moves)
