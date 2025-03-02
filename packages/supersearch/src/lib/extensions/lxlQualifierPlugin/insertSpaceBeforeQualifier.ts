import { EditorState, RangeSet, RangeValue, type TransactionSpec } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

const insertSpaceBeforeQualifier = (getRanges: () => RangeSet<RangeValue>) => {
	return EditorState.transactionFilter.of((tr) => {
		const newCursorPos = tr.state.selection.main.head;

		if (!tr.docChanged || (tr.isUserEvent('delete') && newCursorPos === 0)) {
			return tr;
		} else {
			let insert: TransactionSpec | TransactionSpec[] = [tr];
			const atomicRanges = getRanges();
			const inputLength = tr.changes.desc.newLength - tr.changes.desc.length;

			// don't use startState.selection because cursor changes are not aways synced
			const oldCursorPos = newCursorPos - inputLength;
			const input = tr.newDoc.slice(oldCursorPos, newCursorPos).toString().trim();

			atomicRanges.between(
				Math.min(oldCursorPos, newCursorPos),
				Math.max(oldCursorPos, newCursorPos),
				(from, to) => {
					if (newCursorPos === from + inputLength) {
						// overlap is at atomic range start

						const isDelete = tr.isUserEvent('delete');
						// don't add space if input is space
						// instead, move cursor back to old pos
						insert = [
							tr,
							{
								...((!!input || isDelete) && {
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
					} else if (newCursorPos === to + inputLength || newCursorPos === to + inputLength - 1) {
						const node = syntaxTree(tr.state).resolveInner(oldCursorPos, 0);
						if (node.parent?.name == 'QualifierValue') {
							console.log('trapped', newCursorPos, to + inputLength);
							insert = [
								// we need to pass the original transaction, or we get a sync error for some reason
								tr,
								// undo the changes of the original transaction
								{
									changes: {
										from: oldCursorPos,
										to: newCursorPos,
										insert: ''
									},
									sequential: true
								},
								// move cursor out of the atomic range and apply the input
								{
									changes: {
										from: to,
										insert: ` ${input}`
									},
									selection: { anchor: to + inputLength + 1 }
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

export default insertSpaceBeforeQualifier;
