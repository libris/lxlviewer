import { EditorState, RangeSet, RangeValue } from '@codemirror/state';

const insertSpace = (getRanges: () => RangeSet<RangeValue>) => {
	return EditorState.transactionFilter.of((tr) => {
		if (!tr.docChanged || (tr.isUserEvent('delete') && tr.state.selection.main.head === 0)) {
			return tr;
		} else {
			let found = false;
			const insert = {
				changes: {
					from: tr.state.selection.main.head,
					to: tr.state.selection.main.head,
					insert: ' '
				},
				sequential: true,
				selection: { anchor: tr.state.selection.main.head }
			};

			// OLD
			// const field = tr.state.field(ranges, false)?.ranges;
			// const atoms = tr.state.facet(EditorView.atomicRanges).map(f => f(_editorView))
			// for (const set of atoms) {
			// 	set.between(0, tr.state.doc.length, (from, to, value) => {
			// 		if (tr.startState.selection.main.head === from) {
			// 			found = true;
			// 			return false;
			// 		}
			// 	})
			// }

			const atomicRanges = getRanges();
			const oldCursorPos = tr.startState.selection.main.head;
			atomicRanges.between(oldCursorPos, oldCursorPos, () => {
				found = true;
				return false;
			});
			return found ? [tr, insert] : tr;
		}
	});
};

export default insertSpace;
