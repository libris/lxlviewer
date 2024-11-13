import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';

/**
 * CodeMirror extension that submits the closest (inclusive ancestor) form element on enter keypresses
 * 
 * @param {string} form Optional id of the `<form>` element with which the input should be associated with (equivalent with
 * the [form attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#form) on HTML Input elements.
 * If omitted, the closest (inclusive ancestor) form element will be submitted.
 */

const submitFormOnEnterKey = (form?: string) => {
	const submitForm = (editorView: EditorView) => {
		const formElement = form ? document.getElementById(form) : editorView.dom?.closest('form');

		if (formElement && formElement instanceof HTMLFormElement) {
			formElement.submit();
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
