import { StateEffect, StateField } from '@codemirror/state';

export interface QualifierSemantic {
	keyLabel?: string;
	valueLabel?: string;
	removeLink?: string;
	invalid: boolean;
}

// export const setQualifierValidity = StateEffect.define<{
//   from: number
//   to: number
//   valid: boolean
// }>()

export const setQualifierSemantic = StateEffect.define<{
	from: number;
	to: number;
	semantic: QualifierSemantic;
}>();

// export type QualifierValidation = Map<string, boolean>

type SemanticMap = Map<string, QualifierSemantic>;

export const qualifierSemanticField = StateField.define<SemanticMap>({
	create() {
		return new Map();
	},

	update(value, tr) {
		const next = new Map(value);

		for (const e of tr.effects) {
			if (e.is(setQualifierSemantic)) {
				next.set(`${e.value.from}-${e.value.to}`, e.value.semantic);
			}
		}

		if (tr.docChanged) {
			const remapped = new Map();
			for (const [k, v] of next) {
				const [from, to] = k.split('-').map(Number);
				remapped.set(`${tr.changes.mapPos(from)}-${tr.changes.mapPos(to)}`, v);
			}
			return remapped;
		}

		return next;
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
