import { EditorState, Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

export const preventNewLine = Prec.highest(
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

export const submitClosestFormOnEnter = Prec.highest(
	keymap.of([
		{
			key: 'Enter',
			run: (editorView) => {
				const closestForm = editorView.dom?.closest('form');
				if (closestForm) {
					closestForm.submit();
				}
				return true; // return true to prevent further to be tried
			}
		}
	])
);
