import { openModal, closeModal, confirm } from "../util/modal.js";
import { onCheat } from "../common/daily.js";

const cube = document.getElementById('cube');
let hinted = false;

document.getElementById('close-hint').addEventListener('click', e => closeModal('hint-modal'));

document.getElementById('hint-button').addEventListener('click', async (e) => {
	console.log('hintclick', e);

	if (!hinted) {
		// rejected confirm dialog:
		//   
		//    A real player would just work it out, you know.
		//
		//        [ Take the hint ]     [ Take the hint ]
		//
		if (!await confirm("Accepting a hint will break your streak", "Take hint")) return;
		hinted = true;
	}

	onCheat();

	// First, check if there are any cells filled in incorrectly
	const wrong = cube.cells.filter(cell =>
		(cell.value !== null) &&
		(cell.value != cell.answer)
	);
	if (wrong.length) {
		showHint(
			{ red: wrong },
			wrong[0],
			wrong.length > 1
				? "The highlighted cells are wrong."
				: "The highlighted cell is wrong."
		);
		return;
	}

	// Next, check for cells we can fill in.
	// Don't rely on pencilmarks just yet.
	for (const cell of cube.cells) {
		if (cell.value !== null) continue;
		if (cellPossibilities(cell).size == 1) {
			showHint(
				{ blue: [cell] },
				cell,
				"You can work out what number goes here."
			)
			return;
		}
	}

	// Next, look for groups we can place a value in.
	// Don't rely on pencilmarks just yet.
	for (const group of cube.groups) {
		const candidates = group.cells.map(cellPossibilities);
		for (let value = 0; value < 16; ++value) {
			const places = candidates.filter(set => set.has(value));
			const [cell, secondCell] = places;
			if (secondCell) continue;
			if (cell.size == 1) continue;
			showHint(
				{ blue: group.cells },
				group.cells[candidates.indexOf(cell)],
				`You can work out where the ${value + 1} goes in this group.`
			);
			return;
		}
	}

	// From here on we need the pencilmarks.
	// Check they're in.
	for (const cell of cube.cells) {
		if (cell.value !== null) continue;
		if (!cell.pencil[cell.answer]) {
			showHint({}, null,
				`There are cells whose answer is not pencilled in.
				Either you have not started using pencil marks,
				or you have made a mistake while doing so.
				The next steps require pencil marks,
				so you may want to turn on "autopencil"
				and press the "fill in pencil marks" button
				in the "assistance" window.`
			);
		}
	}

	// Next, check for cells we can fill in,
	// but this time using the now-trustworthy pencilmarks
	for (const cell of cube.cells) {
		if (cell.value !== null) continue;
		if (cellPossibilitiesWithPencil(cell).size == 1) {
			showHint(
				{ blue: [cell] },
				cell,
				"You can work out what number goes here."
			)
			return;
		}
	}

	// Next, look for groups we can place a value in,
	// but this time using the now-trustworthy pencilmarks
	for (const group of cube.groups) {
		const candidates = group.cells.map(cellPossibilitiesWithPencil);
		for (let value = 0; value < 16; ++value) {
			const places = candidates.filter(set => set.has(value));
			const [cell, secondCell] = places;
			if (secondCell) continue;
			if (cell.size == 1) continue;
			showHint(
				{ blue: group.cells },
				group.cells[0],
				`You can work out where the ${value + 1} goes in this group.`
			);
			return;
		}
	}

	// Now it's time for stuff we can't easily work out here,
	// but stored in the "moves" property of the puzzle itself.
	for (const move of cube.solution) {
		console.log(move)

		// We've covered these:
		if ("onlyPlaceFor" in move) {
			const cell = cube.cells[move.cell];
			if (cell.value != move.onlyPlaceFor)
				throw new Error("Move not done");
			continue;
		}
		if ("canOnlyBe" in move) {
			const cell = cube.cells[move.cell];
			if (cell.value != move.canOnlyBe)
				throw new Error("Move not done");
			continue;
		}

		// Next, pointers
		if ("pointingGroup" in move) {
			const {
				pointingGroup,
				pointingIntoGroup,
				pointingValue: value,
				affectedCells
			} = move;
			// Check if we've already done it
			if (!affectedCells.some(i => cube.cells[i].pencil[value])) continue;
			const a = cube.groups[pointingGroup].cells,
				b = cube.groups[pointingIntoGroup].cells;
			showHint(
				{
					blue: a.filter(c => !b.includes(c)),
					red: b.filter(c => !a.includes(c)),
					purple: a.filter(c => b.includes(c))
				},
				a.filter(c => b.includes(c))[0],
				`The only cells in the blue group that can
				be a ${value + 1} are also in the red group.
				Therefore, no other cells in the red group
				can be a ${value + 1}`
			);
			return;
		}

		// Then partitions (it actually doesn't matter what order we put this code in, since we're moving through the "moves" array in its own native order, but let's put them in order of complexity anyway)
		if ("couldBe" in move) {
			const { couldBe, couldNotBe, group: groupId, numbers } = move;
			const group = cube.groups[groupId];
			const antiNumbers = [];
			for (let i = 0; i < 16; ++i) {
				if (numbers.includes(i)) continue;
				if (group.cells.some(cell => cell.value === i)) continue;
				antiNumbers.push(i);
			}

			// Check if it's been done
			if (!couldBe.some(i => antiNumbers.some(j => cube.cells[i].pencil[j]))) continue;

			// If somehow the user has solved any extra cells then pretend we had noticed.
			for (const cell of [...couldBe]) if (cell.value !== null) {
				couldBe.splice(couldBe.indexOf(cell), 1);
				numbers.splice(numbers.indexOf(cell.value), 1);
			}
			for (const cell of [...couldNotBe]) if (cell.value !== null) {
				couldNotBe.splice(couldNotBe.indexOf(cell), 1);
				antiNumbers.splice(antiNumbers.indexOf(cell.value), 1);
			}

			const a = couldBe.map(i => cube.cells[i]),
				b = couldNotBe.map(i => cube.cells[i]);
			const highlights = {
				yellow: group.cells.filter(c => !a.includes(c) && !b.includes(c)),
				blue: a,
				red: b,
			}
			
			if (couldBe.length <= couldNotBe.length) {
				showHint(
					highlights,
					a[0],
					`The blue cells are the only places
					in the highlighted group that the
					${valueList(numbers)} can go.
					Therefore, they cannot be anything else.`
				);
			} else {
				showHint(
					highlights,
					b[0],
					`The red cells can only be ${valueList(antiNumbers, "or")}.
					Therefore, no other cell in the highlighted group
					can contain those numbers.`
				);
			}
			return;
		}

		// Lastly, swordfish
		if ("chain" in move) {
			const { group, chain, value, ruledOutFrom, parity } = move;
			if(!ruledOutFrom.some(i => cube.cells[i].pencil[value])) continue;
			const first = cube.cells[chain[0]],
				chainBody = chain.slice(1, chain.length - 1).map(i => cube.cells[i]),
				last = cube.cells[chain[chain.length - 1]];
			showHint(
				{
					blue: cube.groups[group].cells,
					yellow: [first, last],
					red: chainBody
				},
				first,
				parity == "even"
					? `If neither of the yellow cells
						contained a ${value + 1},
						it would not be possible to complete the red
						${chainBody.length > 1 ? "cells" : "cell"}.
						Therefore, one of the yellow cells
						must be a ${value + 1}, and we can
						rule it out of the rest of the blue group.`
					: `If there were a ${value + 1}
						in either of the yellow cells,
						it would not be possible to complete the red
						${chainBody.length > 1 ? "cells" : "cell"}.
						Therefore, the yellow cells cannot be ${value + 1}.`
			);
			return;
		}
	}

	// well this shouldn't happen, but ok, let's handle it.
	// er...
	const unsolved = cube.cells.filter(c => c.value === null);
	const gimme = unsolved[~~(Math.random() * unsolved.length)];
	showHint({ blue: gimme }, gimme, `The highlighted cell is a ${cell.answer + 1}.`);
	// Yeah, that'll do.
});

function valueList(values, word = "and") {
	values = values.map(v => v + 1).sort((a, b) => a - b);
	const last = values.pop();
	if (!values.length) return last.toString();
	return `${values.join(", ")} ${word} ${last}`;
}

function cellPossibilities(cell) {
	if (cell.value !== null) return new Set([cell.value]);
	const candidates = new Set();
	for (let i = 0; i < 16; ++i) candidates.add(i);
	for (const group of cell.groups)
		for (const cell of group.cells)
			candidates.delete(cell.value);
	return candidates;
}

function cellPossibilitiesWithPencil(cell) {
	if (cell.value !== null) return new Set([cell.value]);
	const candidates = new Set();
	for (let i = 0; i < 16; ++i)
		if (cell.pencil[i])
			candidates.add(i);
	return candidates;
}

function showHint(highlights, spinTo, text) {
	for (const cell of cube.cells)
		cell.clearHighlights();
	for (const colour in highlights)
		for (const cell of highlights[colour])
			cell.highlight(`highlight-${colour}`);
	if (spinTo) {
		cube.spinToCell(spinTo);
		cube.pushUndo(spinTo);
	}
	const p = document.getElementById("hint-text");
	p.innerText = "";
	p.appendChild(document.createTextNode(text));
	openModal("hint-modal");
}