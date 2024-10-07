import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

const preventArrowDownKey = Prec.highest(
	keymap.of([
		{
			key: 'ArrowDown',
			run: () => true
		}
	])
);

export default preventArrowDownKey;
