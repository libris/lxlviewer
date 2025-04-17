import { EditorState, RangeSet, RangeValue, type TransactionSpec } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * Prevent an atomic qualifier from breaking by inserting a space when typing before it,
 * or a space after when typing after it. Also move the cursor out when trapped inside of it.
 */
const insertSpaceAroundQualifier = (getRanges: () => RangeSet<RangeValue>) => {
	return EditorState.transactionFilter.of((tr) => {
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
		const atomicRanges = getRanges();

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

			if (
				(inputRangeMin >= atomicStart && inputRangeMin <= atomicEnd) ||
				(inputRangeMax <= atomicEnd && inputRangeMax >= atomicStart)
			) {
				// input is within the atomic range
				const leftNode = syntaxTree(tr.startState).resolveInner(
					isDelete ? newCursorPos : oldCursorPos,
					-1
				);
				const rightNode = syntaxTree(tr.startState).resolveInner(
					isDelete ? oldCursorPos : newCursorPos,
					+1
				);
				if (leftNode.parent?.name === 'QualifierValue') {
					if (inputRangeMin < atomicEnd) {
						// Stuck inside qualifier, move out

						// we need to pass the original transaction, or we get a sync error for some reason.
						// Undo it before applying changes
						insert = [
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
								selection: { anchor: atomicEnd + inputLength + 1 }
							}
						];
					} else if (input || (isDelete && nextChar)) {
						// At qualifier end, insert space before input
						insert = [{ changes: { from: atomicEnd, insert: ' ' } }, tr];
					}
				} else if (rightNode.parent?.name === 'QualifierKey' || rightNode.name === 'FilterAlias') {
					if ((input && inputRangeMin === atomicStart) || (isDelete && prevChar)) {
						// At qualifier start, insert space after input
						insert = [tr, { changes: { from: atomicStart, insert: ' ' } }];
					}
				}
			}
			return false;
		});
		return insert;
	});
};

export default insertSpaceAroundQualifier;
