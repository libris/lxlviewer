import type { SyntaxNode } from '@lezer/common';
import { syntaxTree } from '@codemirror/language';
import { StateField, RangeSet, RangeSetBuilder, RangeValue, EditorState } from '@codemirror/state';
import type {
	QualifierState,
	QualifierStateField,
	QualifierValidator
} from '$lib/types/lxlQualifierPlugin.js';
import { sendMessage } from '$lib/utils/sendMessage.js';
import { qualifierValidatorFacet } from './qualifierFacet.js';

class AtomicRange extends RangeValue {}
const atomicRange = new AtomicRange();

export const qualifierStateField = StateField.define<QualifierStateField>({
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

function computeQualifierState(state: EditorState): QualifierStateField {
	const validator = state.facet(qualifierValidatorFacet);

	const qualifiers = new Map<string, QualifierState>();
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

			const validatedQualifier = validateQualifier(node.node, state, validator);

			if (validatedQualifier.invalid) return;

			const key = `${node.from}-${node.to}`;
			qualifiers.set(key, validatedQualifier);

			if (validatedQualifier.atomicFrom != null && validatedQualifier.atomicTo != null) {
				builder.add(validatedQualifier.atomicFrom, validatedQualifier.atomicTo, atomicRange);
			}
		}
	});

	return {
		qualifiers,
		atomicRanges: builder.finish()
	};
}

function validateQualifier(
	node: SyntaxNode,
	state: EditorState,
	validate: QualifierValidator
): QualifierState {
	const keyNode = node.getChild('QualifierKey');
	const valueNode = node.getChild('QualifierValue');
	const opNode = node.getChild('QualifierOperator');

	const keyText = keyNode ? state.doc.sliceString(keyNode.from, keyNode.to) : '';
	const valueText = valueNode ? state.doc.sliceString(valueNode.from, valueNode.to) : undefined;

	const validatedQualifier = validate(keyText, valueText);
	const atomicFrom = validatedQualifier.invalid ? undefined : node.from;
	const atomicTo = validatedQualifier.valueLabel ? node.to : opNode?.to;

	return {
		...validatedQualifier,
		key: keyText,
		atomicFrom,
		atomicTo,
		node
	};
}
