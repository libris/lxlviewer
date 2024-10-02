import { EditorState, Prec } from '@codemirror/state';

/**
 * CodeMirror extension which prevents inserted newlines
 */

const preventNewLine = Prec.highest(
	EditorState.transactionFilter.of((tr) => {
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
			return [tr];
		}
	})
);

export default preventNewLine;
