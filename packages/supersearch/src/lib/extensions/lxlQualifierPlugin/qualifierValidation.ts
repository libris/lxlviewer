import { StateField, StateEffect, RangeSet, RangeSetBuilder, RangeValue } from '@codemirror/state';

export interface QualifierValidationResponse {
	key: string;
	value?: string;
	keyLabel?: string;
	valueLabel?: string;
	removeLink?: string;
	invalid: boolean;
}

export interface QualifierSemantic extends QualifierValidationResponse {
	// from: number
	// to: number
	atomicFrom?: number;
	atomicTo?: number;
}

// export const setQualifierValidity = StateEffect.define<{
//   from: number
//   to: number
//   valid: boolean
// }>()

class AtomicRange extends RangeValue {}
export const atomicRange = new AtomicRange();

export const setQualifierSemantic = StateEffect.define<{
	from: number;
	to: number;
	semantic: QualifierSemantic;
}>();

// export type QualifierValidation = Map<string, boolean>

export const qualifierSemanticField = StateField.define<{
	data: Map<string, QualifierSemantic>;
	atomicRanges: RangeSet<RangeValue>;
}>({
	create() {
		return {
			data: new Map(),
			atomicRanges: RangeSet.empty
		};
	},

	update(value, tr) {
		let data = value.data;
		let atomicRanges = value.atomicRanges;
		let changed = false;

		for (const e of tr.effects) {
			if (!e.is(setQualifierSemantic)) continue;

			if (!changed) {
				data = new Map(data);
				changed = true;
			}

			const { from, to, semantic } = e.value;
			const key = `${from}-${to}`;
			data.set(key, semantic);
		}

		if (!changed) return value;

		const builder = new RangeSetBuilder<RangeValue>();

		const entries = [...data.values()]
			.filter((v) => !v.invalid && v.atomicFrom != null && v.atomicTo != null)
			.sort((a, b) => a.atomicFrom! - b.atomicFrom!);

		for (const v of entries) {
			builder.add(v.atomicFrom!, v.atomicTo!, atomicRange);
		}

		atomicRanges = builder.finish();

		return { data, atomicRanges };
	}
});

// export const qualifierValidationField = StateField.define<QualifierValidation>({
//   create() {
//     return new Map()
//   },

//   update(value, tr) {
//     let next = new Map(value)

//     for (let e of tr.effects) {
//       if (e.is(setQualifierValidity)) {
//         next.set(`${e.value.from}-${e.value.to}`, e.value.valid)
//       }
//     }

//     if (tr.docChanged) {
//       const remapped = new Map()
//       for (let [k, v] of next) {
//         const [from, to] = k.split("-").map(Number)
//         remapped.set(
//           `${tr.changes.mapPos(from)}-${tr.changes.mapPos(to)}`,
//           v
//         )
//       }
//       return remapped;
//     }

//     return next;
//   }
// })
