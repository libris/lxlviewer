import { EditorState, Prec } from '@codemirror/state';

const preventNewLine = Prec.highest(
	EditorState.transactionFilter.of((tr) => {
		console.log('tr', tr);
		if (tr.newDoc.lines > 1) {
			return [
				tr,
				{
					changes: {
						from: 0,
						to: tr.newDoc.length,
						insert: tr.newDoc.sliceString(0, undefined, '')
					},
					sequential: true
				}
			];
		} else {
			return tr;
		}
	})
);

export default preventNewLine;
