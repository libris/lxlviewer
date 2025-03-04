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

		if (!isInput && !isDelete) {
			// return non-user transactions (triggered by this filter)
			return tr;
		}

		const inputLength = tr.changes.desc.newLength - tr.changes.desc.length;
		const newCursorPos = tr.state.selection.main.head;
		const oldCursorPos = newCursorPos - inputLength;

		if (!tr.docChanged || (isDelete && newCursorPos === 0)) {
			return tr;
		}
		let insert: TransactionSpec | TransactionSpec[] = [tr];
		const atomicRanges = getRanges();

		atomicRanges.between(
			Math.min(oldCursorPos, newCursorPos),
			Math.max(oldCursorPos, newCursorPos),
			(atomicStart, atomicEnd) => {
				const input = tr.newDoc.slice(oldCursorPos, newCursorPos).toString().trim();

				if (oldCursorPos === atomicStart) {
					// input touches atomic range start
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
				} else if (oldCursorPos >= atomicStart && oldCursorPos <= atomicEnd) {
					const node = syntaxTree(tr.state).resolveInner(oldCursorPos, -1);
					if (node.parent?.name == 'QualifierValue') {
						// input touches atomic range up until end
						insert = [
							// we need to pass the original transaction, or we get a sync error for some reason.
							// Undo the changes, move cursor out and apply changes.
							tr,
							{
								changes: {
									from: Math.min(oldCursorPos, newCursorPos),
									to: Math.max(oldCursorPos, newCursorPos),
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
				} else if (newCursorPos === atomicEnd && inputLength < 0) {
					const node = syntaxTree(tr.state).resolveInner(newCursorPos, -1);
					if (node.parent?.name == 'QualifierValue') {
						// deletion touches qualifierValue end, preserve space
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
			}
		);
		return insert;
	});
};

export default insertSpaceAroundQualifier;
