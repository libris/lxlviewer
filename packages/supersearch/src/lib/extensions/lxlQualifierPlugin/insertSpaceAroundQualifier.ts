import type { Transaction, TransactionSpec } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { qualifierStateField } from './qualifierValidation.js';

/**
 * Prevent an atomic qualifier from breaking by inserting a space when typing before it,
 * or a space after when typing after it. Also move the cursor out when trapped inside of it.
 */
const insertSpaceAroundQualifier = (tr: Transaction) => {
	const isDelete = tr.isUserEvent('delete');
	const isInput = tr.isUserEvent('input');

	if (!tr.docChanged || (!isInput && !isDelete)) {
		// return transactions triggered by this filter
		return tr;
	}

	let insert: TransactionSpec | TransactionSpec[] = [tr];
	const inputLength = tr.changes.desc.newLength - tr.changes.desc.length;
	const oldCursorPos = Math.max(
		tr.startState.selection.main.anchor,
		tr.startState.selection.main.head
	);
	const newCursorPos = oldCursorPos + inputLength;
	const inputRangeMin = Math.min(oldCursorPos, newCursorPos);
	const inputRangeMax = Math.max(oldCursorPos, newCursorPos);
	const atomicRanges = tr.startState.field(qualifierStateField).atomicRanges;

	atomicRanges.between(inputRangeMin, inputRangeMax, (atomicStart, atomicEnd) => {
		const input = tr.newDoc.slice(oldCursorPos, newCursorPos).toString().trim();
		const prevChar = tr.newDoc
			.slice(inputRangeMin - 1, inputRangeMin)
			.toString()
			.trim();
		const nextChar = tr.newDoc
			.slice(inputRangeMax - 1, inputRangeMax)
			.toString()
			.trim();

		if (oldCursorPos === atomicStart && (input || (isDelete && prevChar))) {
			// input touches atomic range start, insert space after input
			insert = [
				tr,
				{
					changes: {
						from: newCursorPos,
						to: newCursorPos,
						insert: ' '
					},
					sequential: true,
					selection: { anchor: newCursorPos }
				}
			];
		} else if (
			oldCursorPos >= atomicStart &&
			oldCursorPos <= atomicEnd &&
			newCursorPos !== atomicStart
		) {
			const node = syntaxTree(tr.startState).resolveInner(oldCursorPos, -1);
			if (node.parent?.name == 'QualifierValue') {
				// input touches qualifier value, insert space before input after range
				insert = [
					// we need to pass the original transaction, or we get a sync error for some reason.
					// Undo it before applying changes
					tr,
					{
						changes: {
							from: inputRangeMin,
							to: inputRangeMax,
							insert: ''
						},
						sequential: true
					},
					{
						changes: {
							from: atomicEnd,
							insert: ` ${input}`
						},
						selection: { anchor: input ? atomicEnd + inputLength + 1 : atomicEnd + 1 }
					}
				];
			}
		} else if (newCursorPos === atomicEnd && isDelete && nextChar) {
			const node = syntaxTree(tr.startState).resolveInner(newCursorPos, -1);
			if (node.parent?.name == 'QualifierValue') {
				// deletion touches qualifierValue end, insert space after input
				insert = [
					{
						changes: {
							from: atomicEnd,
							insert: ' '
						}
					},
					tr
				];
			}
		}
		return false;
	});
	return insert;
};

export default insertSpaceAroundQualifier;
