import { StateField, RangeSet, RangeSetBuilder, RangeValue, EditorState } from '@codemirror/state';
import type { QualifierSemantic, QualifierValidator } from '$lib/types/lxlQualifierPlugin.js';
import { qualifierValidatorFacet } from './qualifierFacet.js';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { sendMessage } from '$lib/utils/sendMessage.js';

// export const setQualifierSemantic = StateEffect.define<QualifierSemantic[]>();

// ✔ StateField computes semantics
// ✔ Atomic ranges come from state
// ✔ ViewPlugin renders only

class AtomicRange extends RangeValue {}
const atomicRange = new AtomicRange();

type QualifierSemanticState = {
	qualifiers: Map<string, QualifierSemantic>;
	atomicRanges: RangeSet<RangeValue>;
};

export const qualifierSemanticField = StateField.define<QualifierSemanticState>({
	create(state) {
		return computeQualifierState(state);
	},

	update(value, tr) {
		if (!tr.docChanged && !tr.effects.some((e) => e.is(sendMessage))) {
			return value;
		}
		return computeQualifierState(tr.state);
	}
});

function computeQualifierState(state: EditorState): QualifierSemanticState {
	const validator = state.facet(qualifierValidatorFacet);

	const qualifiers = new Map<string, QualifierSemantic>();
	const builder = new RangeSetBuilder<RangeValue>();

	if (!validator) {
		return {
			qualifiers,
			atomicRanges: RangeSet.empty
		};
	}

	syntaxTree(state).iterate({
		enter(node) {
			if (node.name !== 'Qualifier') return;

			const semantic = computeQualifierSemantic(node.node, state, validator);

			if (semantic.invalid) return;

			const key = `${node.from}-${node.to}`;
			qualifiers.set(key, semantic);

			if (semantic.atomicFrom != null && semantic.atomicTo != null) {
				builder.add(semantic.atomicFrom, semantic.atomicTo, atomicRange);
			}
		}
	});

	return {
		qualifiers,
		atomicRanges: builder.finish()
	};
}

function computeQualifierSemantic(
	node: SyntaxNode,
	state: EditorState,
	validate: QualifierValidator
): QualifierSemantic {
	const keyNode = node.getChild('QualifierKey');
	const valueNode = node.getChild('QualifierValue');
	const opNode = node.getChild('QualifierOperator');

	const keyText = keyNode ? state.doc.sliceString(keyNode.from, keyNode.to) : '';

	const valueText = valueNode ? state.doc.sliceString(valueNode.from, valueNode.to) : undefined;

	const semantic = validate(keyText, valueText);
	const atomicFrom = semantic.invalid ? undefined : node.from;
	const atomicTo = semantic.valueLabel ? node.to : opNode?.to;

	return {
		...semantic,
		key: keyText,
		atomicFrom,
		atomicTo,
		node
	};
}
