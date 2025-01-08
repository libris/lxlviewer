import { EditorState, RangeSet, RangeValue } from '@codemirror/state';

const insertSpaceBeforeQualifier = (getRanges: () => RangeSet<RangeValue>) => {
	return EditorState.transactionFilter.of((tr) => {
		if (!tr.docChanged || (tr.isUserEvent('delete') && tr.state.selection.main.head === 0)) {
			return tr;
		} else {
			let insert = {};
			const atomicRanges = getRanges();
			const oldCursorPos = tr.startState.selection.main.head;
			const newCursorPos = tr.state.selection.main.head;

			atomicRanges.between(oldCursorPos, oldCursorPos, () => {
				insert = {
					changes: {
						from: newCursorPos,
						to: newCursorPos,
						insert: ' '
					},
					sequential: true,
					selection: { anchor: newCursorPos }
				};
				return false;
			});
			return [tr, insert];
		}
	});
};

export default insertSpaceBeforeQualifier;
