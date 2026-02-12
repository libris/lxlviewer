import { StateEffect } from '@codemirror/state';

export const startEditingQualifier = StateEffect.define<{
	from: number;
	to: number;
}>({
	map(value, mapping) {
		const from = mapping.mapPos(value.from);
		const to = mapping.mapPos(value.to);
		return from <= to ? { from, to } : undefined;
	}
});

export const stopEditingQualifier = StateEffect.define<void>();
