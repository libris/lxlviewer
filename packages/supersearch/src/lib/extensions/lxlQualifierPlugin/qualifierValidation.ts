import type { QualifierSemantic } from '$lib/types/lxlQualifierPlugin.js';
import { StateField, StateEffect } from '@codemirror/state';

// class AtomicRange extends RangeValue {}
// export const atomicRange = new AtomicRange();

export const setQualifierSemantic = StateEffect.define<QualifierSemantic>();

export const qualifierSemanticField = StateField.define<Map<string, QualifierSemantic>>({
	create() {
		return new Map();
	},

	update(value, tr) {
		// let data = value.data;
		// let atomicRanges = value.atomicRanges;
		let changed = false;
		let data = value;

		for (const e of tr.effects) {
			if (!e.is(setQualifierSemantic)) continue;

			if (!changed) {
				data = new Map();
				changed = true;
			}

			const semantic = e.value;
			if (semantic.invalid) continue;

			const key = `${semantic.node.from}-${semantic.node.to}`;
			data.set(key, semantic);
		}

		// if (!changed) return value;

		// const builder = new RangeSetBuilder<RangeValue>();

		// const entries = [...data.values()]
		// 	.filter((v) => !v.invalid && v.atomicFrom != null && v.atomicTo != null)
		// 	.sort((a, b) => a.atomicFrom! - b.atomicFrom!);

		// for (const v of entries) {
		// 	builder.add(v.atomicFrom!, v.atomicTo!, atomicRange);
		// }

		// atomicRanges = builder.finish();

		return data;
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
