import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';

/**
 * CodeMirror extension that submits the closest (inclusive ancestor) form element on enter keypresses
 */

function submitForm(editorView: EditorView) {
	const closestForm = editorView.dom?.closest('form');

	if (closestForm) {
		closestForm.submit();
		return true; // return true to prevent further commands to be tried
	}

	return false;
}

const submitFormOnEnterKey = Prec.highest(
	keymap.of([
		{
			key: 'Enter',
			run: submitForm
		},
		{
			key: 'Shift-Enter',
			run: submitForm
		}
	])
);

export default submitFormOnEnterKey;
