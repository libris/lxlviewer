import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

/**
 * CodeMirror extension which submits the closest form element on enter keypresses
 */

const submitClosestFormOnEnter = Prec.highest(
	keymap.of([
		{
			key: 'Enter',
			run: (editorView) => {
				const closestForm = editorView.dom?.closest('form');
				if (closestForm) {
					closestForm.submit();
					return true; // return true to prevent further to be tried
				}
				return false;
			}
		}
	])
);

export default submitClosestFormOnEnter;
