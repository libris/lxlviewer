import { StateField, StateEffect, RangeSet, RangeSetBuilder, RangeValue } from '@codemirror/state';
import type { QualifierSemantic } from '$lib/types/lxlQualifierPlugin.js';

export const setQualifierSemantic = StateEffect.define<QualifierSemantic[]>();

class AtomicRange extends RangeValue {}
const atomicRange = new AtomicRange();

type QualifierSemanticState = {
	qualifiers: Map<string, QualifierSemantic>;
	atomicRanges: RangeSet<RangeValue>;
};

export const qualifierSemanticField = StateField.define<QualifierSemanticState>({
	create() {
		return {
			qualifiers: new Map(),
			atomicRanges: RangeSet.empty
		};
	},

	update(value, tr) {
		let nextQualifiers: Map<string, QualifierSemantic> | null = null;

		for (const e of tr.effects) {
			if (!e.is(setQualifierSemantic)) continue;

			// 🔑 Replace semantics atomically
			nextQualifiers = new Map();

			for (const semantic of e.value) {
				if (semantic.invalid) continue;

				const key = `${semantic.node.from}-${semantic.node.to}`;
				nextQualifiers.set(key, semantic);
			}
		}

		if (!nextQualifiers) return value;

		// 🔑 Build atomic ranges deterministically
		const builder = new RangeSetBuilder<RangeValue>();

		for (const semantic of nextQualifiers.values()) {
			if (semantic.atomicFrom == null || semantic.atomicTo == null) continue;
			builder.add(semantic.atomicFrom, semantic.atomicTo, atomicRange);
		}

		return {
			qualifiers: nextQualifiers,
			atomicRanges: builder.finish()
		};
	}
});
