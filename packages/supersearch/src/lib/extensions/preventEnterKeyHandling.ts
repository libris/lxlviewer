import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

/**
 * CodeMirror extension prevents inserted newlines and further commands to be tried when pressing Enter
 * or Shift-Enter (form submits should be handled inside SuperSearch.svelte)
 */

const preventEnterKeyHandling = () => {
	const preventFurtherCommands = () => {
		return true; // return true to prevent further commands to be tried
	};

	return Prec.high(
		keymap.of([
			{
				key: 'Enter',
				run: preventFurtherCommands
			},
			{
				key: 'Shift-Enter',
				run: preventFurtherCommands
			}
		])
	);
};

export default preventEnterKeyHandling;
