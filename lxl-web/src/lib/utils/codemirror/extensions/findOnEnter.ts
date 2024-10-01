import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { goto } from '$app/navigation';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';

/**
 * CodeMirror extension which submits the closest form element on enter keypresses
 */

const findOnEnter = Prec.highest(
	keymap.of([
		{
			key: 'Enter',
			run: (editorView) => {
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
		}
	])
);

export default findOnEnter;
