import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

/**
 * CodeMirror extension which controls if arrow key cursor handling should be enabled or not depending on passed param
 */

const arrowKeyCursorHandling = ({
	vertical,
	horizontal
}: {
	vertical: boolean;
	horizontal: boolean;
}) => {
	return Prec.highest(
		keymap.of([
			{
				key: 'ArrowUp',
				run: () => !vertical // return true to prevent further commands to be tried
			},
			{
				key: 'ArrowDown',
				run: () => !vertical
			},
			{
				key: 'ArrowRight',
				run: () => !horizontal
			},
			{
				key: 'ArrowLeft',
				run: () => !horizontal
			}
		])
	);
};

export default arrowKeyCursorHandling;
