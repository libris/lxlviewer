import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';

/**
 * CodeMirror extension that submits form elements (either the closest or by specified id using the `form` attribute) on enter keypresses.
 *
 * @param {string} form Optional id of the `<form>` element with which the form control should be associated with (equivalent with
 * the [form attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#form) on HTML Input elements).
 */

const submitFormOnEnterKey = (form?: string) => {
	const submitForm = (editorView: EditorView) => {
		const formElement = form ? document.getElementById(form) : editorView.dom?.closest('form');

		if (formElement && formElement instanceof HTMLFormElement) {
			formElement.requestSubmit();
			return true; // return true to prevent further commands to be tried
		}

		return false;
	};

	return Prec.highest(
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
};

export default submitFormOnEnterKey;
