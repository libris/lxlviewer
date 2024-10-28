import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { goto } from '$app/navigation';
import { getFullSearchLink } from '$lib/utils/supersearch/getFullSearchLink';
/**
 * CodeMirror extension which submits the closest form element on enter keypresses
 */

function find(editorView: EditorView) {
	const closestForm = editorView.dom?.closest('form');
	if (closestForm) {
		const link = getFullSearchLink(new FormData(closestForm).get('_q')?.toString() || '');
		if (link) {
			goto(link);
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
