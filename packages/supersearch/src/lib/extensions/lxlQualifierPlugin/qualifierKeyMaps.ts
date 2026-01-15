import { keymap } from '@codemirror/view';
import { qualifierStateField } from './qualifierValidation.js';
import { stopEditingQualifier } from './qualifierEffects.js';

export const stopEditingOnEsc = keymap.of([
	{
		key: 'Escape',
		run(view) {
			const state = view.state;
			const { editing } = state.field(qualifierStateField);

			if (!editing) return false;

			view.dispatch({
				effects: stopEditingQualifier.of(undefined)
			});

			return true;
		}
	}
]);
