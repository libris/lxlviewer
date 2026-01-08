import type { SyntaxNode } from '@lezer/common';
import { messages } from '$lib/constants/messages.js';
import { sendMessage } from '$lib/utils/sendMessage.js';
import type { EditorState, Transaction } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { setQualifierSemantic } from './qualifierValidation.js';
import type { QualifierSemantic, QualifierValidator } from '$lib/types/lxlQualifierPlugin.js';
import { qualifierValidatorFacet } from './qualifierFacet.js';

export const validateQualifiers = (tr: Transaction) => {
	const needsRevalidate =
		tr.docChanged ||
		tr.effects.some((e) => e.is(sendMessage) && e.value.message === messages.NEW_DATA);

	if (!needsRevalidate) return null;

	const state = tr.state;
	const validator = state.facet(qualifierValidatorFacet);
	if (!validator) return null;

	const semantics: QualifierSemantic[] = [];

	syntaxTree(state).iterate({
		enter(node) {
			if (node.name !== 'Qualifier') return;
			const semantic = computeQualifierSemantic(node.node, state, validator);
			if (!semantic.invalid) {
				semantics.push(semantic);
			}
		}
	});

	return {
		effects: [setQualifierSemantic.of(semantics)]
	};
};

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
