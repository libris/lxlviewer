import type { ViewUpdate } from '@codemirror/view';
import { Annotation } from '@codemirror/state';
import {
	startEditingQualifier,
	stopEditingQualifier
} from '$lib/extensions/lxlQualifierPlugin/qualifierEffects.js';

export const syncedTransaction = Annotation.define<boolean>();

export function isViewUpdateSyncableEffect(update: ViewUpdate) {
	const effects = [];

	for (const tr of update.transactions) {
		for (const e of tr.effects) {
			if (e.is(startEditingQualifier) || e.is(stopEditingQualifier)) {
				effects.push(e);
			}
		}
	}

	return effects;
}
