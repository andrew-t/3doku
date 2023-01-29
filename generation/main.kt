// package wasm

// import kotlinx.interop.wasm.dom.*

// This could just be a UShort but kotlin seems bad at literals for those and we have lots of memory so an int32 is fine and tbqh at that point there's no reason it need be unsigned
typealias Clue = Int

// oh yeah, cells are bitfields
val ALL: Clue = 65535

fun main() {

}

public fun generate() {
	// don't bother generating the grid, we did that in js and here is the result:
	val groupsByCell = arrayOf(setOf(12,0,4),setOf(12,0,5),setOf(12,0,6),setOf(12,0,7),setOf(12,1,4),setOf(12,1,5),setOf(12,1,6),setOf(12,1,7),setOf(12,2,4),setOf(12,2,5),setOf(12,2,6),setOf(12,2,7),setOf(12,3,4),setOf(12,3,5),setOf(12,3,6),setOf(12,3,7),setOf(13,0,7),setOf(13,0,6),setOf(13,0,5),setOf(13,0,4),setOf(13,1,7),setOf(13,1,6),setOf(13,1,5),setOf(13,1,4),setOf(13,2,7),setOf(13,2,6),setOf(13,2,5),setOf(13,2,4),setOf(13,3,7),setOf(13,3,6),setOf(13,3,5),setOf(13,3,4),setOf(14,8,4),setOf(14,8,5),setOf(14,8,6),setOf(14,8,7),setOf(14,9,4),setOf(14,9,5),setOf(14,9,6),setOf(14,9,7),setOf(14,10,4),setOf(14,10,5),setOf(14,10,6),setOf(14,10,7),setOf(14,11,4),setOf(14,11,5),setOf(14,11,6),setOf(14,11,7),setOf(15,8,7),setOf(15,8,6),setOf(15,8,5),setOf(15,8,4),setOf(15,9,7),setOf(15,9,6),setOf(15,9,5),setOf(15,9,4),setOf(15,10,7),setOf(15,10,6),setOf(15,10,5),setOf(15,10,4),setOf(15,11,7),setOf(15,11,6),setOf(15,11,5),setOf(15,11,4),setOf(16,0,11),setOf(16,0,10),setOf(16,0,9),setOf(16,0,8),setOf(16,1,11),setOf(16,1,10),setOf(16,1,9),setOf(16,1,8),setOf(16,2,11),setOf(16,2,10),setOf(16,2,9),setOf(16,2,8),setOf(16,3,11),setOf(16,3,10),setOf(16,3,9),setOf(16,3,8),setOf(17,0,8),setOf(17,0,9),setOf(17,0,10),setOf(17,0,11),setOf(17,1,8),setOf(17,1,9),setOf(17,1,10),setOf(17,1,11),setOf(17,2,8),setOf(17,2,9),setOf(17,2,10),setOf(17,2,11),setOf(17,3,8),setOf(17,3,9),setOf(17,3,10),setOf(17,3,11))

	val cellsByGroup = Array(18) { i ->
		val s = mutableSetOf<Int>()
		for (c: Int in 0..95)
			if (groupsByCell[c].contains(i))
				s.add(c)
		s.toSet()
	}

	// println(groupsByCell.joinToString())
	// println(cellsByGroup.joinToString())

	iterate@ while (true) {
		val cells = Array<Clue>(16*6) { i -> ALL }
		val clues = Array(16*6) { _ -> false }
		val solved = mutableSetOf<Int>()
		val randomOrder = MutableList(16*6) { i -> i }
		randomOrder.shuffle()

		for (nextClueCell in randomOrder) {
			if (solved.contains(nextClueCell))
				continue

			// put in the next random clue
			val bitfield = cells[nextClueCell];
			if (bitfield == 0)
				continue@iterate
			val randomOrder = Array(16) { i -> i }
			randomOrder.shuffle()
			for (guess in randomOrder)
				if (bitfield and (1 shl guess) > 0) {
					val shifted = 1 shl guess
					cells[nextClueCell] = shifted
					val inv = shifted.inv()
					for (g in groupsByCell[nextClueCell])
						for (neighbour in cellsByGroup[g])
							if (neighbour != nextClueCell)
								cells[neighbour] = cells[neighbour] and inv
				}
			solved.add(nextClueCell)
			clues[nextClueCell] = true

			// deduce anything we can
		}

		// if we got here without error then i guess it worked
		// TODO: return cells in a less stupid format
		// document.body.innerText = clues.joinToString()
		println(clues.joinToString())
	}
}
