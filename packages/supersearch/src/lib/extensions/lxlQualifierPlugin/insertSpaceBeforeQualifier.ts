import { EditorState, RangeSet, RangeValue } from '@codemirror/state';

const insertSpaceBeforeQualifier = (getRanges: () => RangeSet<RangeValue>) => {
	return EditorState.transactionFilter.of((tr) => {
		if (!tr.docChanged || (tr.isUserEvent('delete') && tr.state.selection.main.head === 0)) {
			return tr;
		} else {
			let insert = {};
			let changes = {};
			const atomicRanges = getRanges();
			const oldCursorPos = tr.startState.selection.main.head;
			const newCursorPos = tr.state.selection.main.head;

			atomicRanges.between(oldCursorPos, oldCursorPos, (from) => {
				if (oldCursorPos === from) {
					// overlap is at atomic range start
					const input = !!tr.newDoc.slice(oldCursorPos, newCursorPos).toString().trim();
					const isDelete = tr.isUserEvent('delete');
					// don't add space if input is space
					// instead, move cursor back to old pos
					if (input || isDelete) {
						changes = {
							from: newCursorPos,
							to: newCursorPos,
							insert: ' '
						};
					}
					insert = {
						changes,
						sequential: true,
						selection: { anchor: input || isDelete ? newCursorPos : oldCursorPos }
					};
				}
				return false;
			});
			return [tr, insert];
		}
	});
};

export default insertSpaceBeforeQualifier;
