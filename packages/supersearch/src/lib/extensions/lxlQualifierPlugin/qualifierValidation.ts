import type { SyntaxNode } from '@lezer/common';
import { syntaxTree } from '@codemirror/language';
import { StateField, RangeSet, RangeSetBuilder, RangeValue, EditorState } from '@codemirror/state';
import type {
	QualifierState,
	QualifierStateField,
	QualifierValidator
} from '$lib/types/lxlQualifierPlugin.js';
import { sendMessage } from '$lib/utils/sendMessage.js';
import { qualifierRenderFacet, qualifierValidatorFacet } from './qualifierFacet.js';
import { messages } from '$lib/constants/messages.js';
import { startEditingQualifier, stopEditingQualifier } from './qualifierEffects.js';

class AtomicRange extends RangeValue {}
const atomicRange = new AtomicRange();

export const qualifierStateField = StateField.define<QualifierStateField>({
	create(state) {
		return computeQualifierState(state, null, 0);
	},

	compare(a, b) {
		return a.version === b.version;
	},

	update(value, tr) {
		let { editing } = value;
		const { version } = value;
		let changed = false;

		for (const e of tr.effects) {
			if (e.is(sendMessage) && e.value.message === messages.NEW_DATA) {
				changed = true;
			}

			if (e.is(startEditingQualifier)) {
				editing = e.value;
				changed = true;
			} else if (e.is(stopEditingQualifier)) {
				editing = null;
				changed = true;
			}
		}

		if (editing && tr.docChanged) {
			const from = tr.changes.mapPos(editing.from, 1);
			const to = tr.changes.mapPos(editing.to, -1);
			const mapped = from < to ? { from, to } : null;

			if (mapped?.from !== editing.from || mapped?.to !== editing.to) {
				editing = mapped;
				changed = true;
			}
		}

		if (tr.docChanged || changed) {
			return computeQualifierState(tr.state, editing, version + 1);
		}

		return value;
	}
});

function computeQualifierState(
	state: EditorState,
	editing: { from: number; to: number } | null,
	version: number
): QualifierStateField {
	const validator = state.facet(qualifierValidatorFacet);
	const renderer = state.facet(qualifierRenderFacet);

	const qualifiers = new Map<string, QualifierState>();
	const builder = new RangeSetBuilder<RangeValue>();

	if (!validator) {
		return {
			qualifiers,
			atomicRanges: RangeSet.empty,
			editing,
			version
		};
	}

	syntaxTree(state).iterate({
		enter(node) {
			if (node.name !== 'Qualifier') return;
			const q = validateQualifier(node.node, state, validator);

			const key = `${node.from}-${node.to}`;
			qualifiers.set(key, q);

			if (
				!q.invalid &&
				q.atomicFrom != null &&
				q.atomicTo != null &&
				!isEditing(editing, q.atomicFrom, q.atomicTo)
			) {
				builder.add(q.atomicFrom, q.atomicTo, atomicRange);
			}
		}
	});

	return {
		qualifiers,
		atomicRanges: !renderer ? RangeSet.empty : builder.finish(),
		editing,
		version
	};
}

function validateQualifier(
	node: SyntaxNode,
	state: EditorState,
	validate: QualifierValidator
): QualifierState {
	const keyNode = node.getChild('QualifierKey');
	const valueNode = node.getChild('QualifierValue');
	const operatorNode = node.getChild('QualifierOperator');

	const keyText = keyNode ? state.doc.sliceString(keyNode.from, keyNode.to) : '';
	const valueText = valueNode ? state.doc.sliceString(valueNode.from, valueNode.to) : undefined;

	const validatedQualifier = validate(keyText, valueText);
	const atomicFrom = validatedQualifier.invalid ? undefined : node.from;
	const atomicTo = validatedQualifier.invalid
		? undefined
		: validatedQualifier.valueLabel
			? node.to
			: operatorNode?.to;

	return {
		...validatedQualifier,
		key: keyText,
		atomicFrom,
		atomicTo,
		node
	};
}

function isEditing(editing: { from: number; to: number } | null, from: number, to: number) {
	return !!editing && editing.from === from && editing.to === to;
}
