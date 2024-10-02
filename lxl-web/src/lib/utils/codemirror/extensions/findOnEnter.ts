import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { goto } from '$app/navigation';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';

/**
 * CodeMirror extension which submits the closest form element on enter keypresses
 */

function find(editorView: EditorView) {
	const closestForm = editorView.dom?.closest('form');
	if (closestForm) {
		const _q = new FormData(closestForm).get('_q')?.toString();
		if (_q) {
			goto(
				'/find?' +
					addDefaultSearchParams(
						new URLSearchParams({
							_q
						})
					).toString()
			);
		}
		return true; // return true to prevent further to be tried
	}
	return false;
}

const findOnEnter = Prec.highest(
	keymap.of([
		{
			key: 'Enter',
			run: find
		},
		{
			key: 'Shift-Enter',
			run: find
		}
	])
);

export default findOnEnter;
