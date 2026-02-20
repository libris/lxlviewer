import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { qualifierStateField } from './qualifierValidation.js';
import { stopEditingQualifier } from './qualifierEffects.js';

export const stopEditingOnEnterOrEsc = Prec.highest(
	keymap.of([
		{
			key: 'Enter',
			run(view) {
				const { editing } = view.state.field(qualifierStateField);
				if (!editing) return false;

				view.dispatch({
					effects: stopEditingQualifier.of(undefined)
				});

				// let existing enter handler run after
				return false;
			}
		},
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
	])
);
