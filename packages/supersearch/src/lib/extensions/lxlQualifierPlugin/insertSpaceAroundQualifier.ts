import { EditorState, RangeSet, RangeValue, type TransactionSpec } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

/**
 * Prevent an atomic qualifier from breaking by inserting a space when typing before it,
 * or a space after when typing after it. Also move the cursor out when trapped inside of it.
 */
const insertSpaceAroundQualifier = (getRanges: () => RangeSet<RangeValue>) => {
	return EditorState.transactionFilter.of((tr) => {
		const newCursorPos = tr.state.selection.main.head;

		if (!tr.docChanged || (tr.isUserEvent('delete') && newCursorPos === 0)) {
			return tr;
		} else {
			let insert: TransactionSpec | TransactionSpec[] = [tr];
			const atomicRanges = getRanges();
			const inputLength = tr.changes.desc.newLength - tr.changes.desc.length;
			// startState.selection can't be trusted because selection changes are not synced
			const oldCursorPos = newCursorPos - inputLength;

			atomicRanges.between(
				Math.min(oldCursorPos, newCursorPos),
				Math.max(oldCursorPos, newCursorPos),
				(atomicStart, atomicEnd) => {
					const input = tr.newDoc.slice(oldCursorPos, newCursorPos).toString().trim();

					if (oldCursorPos === atomicStart) {
						// input touches atomic range start
						const isDelete = tr.isUserEvent('delete');
						insert = [
							tr,
							{
								...((!!input || isDelete) && {
									// don't insert space if input is space
									changes: {
										from: newCursorPos,
										to: newCursorPos,
										insert: ' '
									}
								}),
								sequential: true,
								selection: { anchor: !!input || isDelete ? newCursorPos : oldCursorPos }
							}
						];
					} else if (oldCursorPos === atomicEnd || oldCursorPos === atomicEnd - 1) {
						// input touches atomic range end
						const node = syntaxTree(tr.state).resolveInner(oldCursorPos, 0);
						if (node.parent?.name == 'QualifierValue') {
							insert = [
								// we need to pass the original transaction, or we get a sync error for some reason.
								// Undo the changes, move cursor out and apply changes.
								tr,
								{
									changes: {
										from: oldCursorPos,
										to: newCursorPos,
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
						}
					}
					return false;
				}
			);
			return insert;
		}
	});
};

export default insertSpaceAroundQualifier;
