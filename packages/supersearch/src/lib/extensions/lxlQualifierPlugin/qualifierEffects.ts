import type { QualifierId } from '$lib/types/lxlQualifierPlugin.js';
import { StateEffect } from '@codemirror/state';

export const startEditingQualifier = StateEffect.define<{
	from: number;
	to: number;
}>({
	map(value, mapping) {
		console.log('hello from mapping', value, mapping);
		const from = mapping.mapPos(value.from);
		const to = mapping.mapPos(value.to);
		return from >= to ? undefined : { from, to };
	}
});

export const stopEditingQualifier = StateEffect.define<QualifierId>();
