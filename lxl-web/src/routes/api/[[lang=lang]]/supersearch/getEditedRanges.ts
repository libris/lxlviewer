import { lxlQuery } from 'codemirror-lang-lxlquery';

type Range = {
	from: number;
	to: number;
};

function getEditedRanges(
	query: string,
	cursor: number
): Range & {
	qualifierKey?: Range;
	qualifierOperator?: Range;
	qualifierValue?: Range;
} {
	const tree = lxlQuery.language.parser.parse(query);
	const innerNode = tree.resolveInner(cursor);

	/**
	 * Return `from` and `to` from qualifier parts if editing qualifier value
	 */
	if (innerNode.parent?.type.is('QualifierValue')) {
		const qualifierNode = innerNode.parent.parent;
		const qualifierKeyNode = qualifierNode?.getChild('QualifierKey');
		const qualifierOperatorNode = qualifierNode?.getChild('QualifierOperator');
		const qualiferValueNode = qualifierNode?.getChild('QualifierValue');
		if (qualifierNode) {
			return {
				from: qualifierNode.from,
				to: qualifierNode.to,
				...(qualifierKeyNode && {
					qualifierKey: { from: qualifierKeyNode.from, to: qualifierKeyNode.to }
				}),
				...(qualifierOperatorNode && {
					qualifierOperator: { from: qualifierOperatorNode.from, to: qualifierOperatorNode.to }
				}),
				...(qualiferValueNode && {
					qualifierValue: { from: qualiferValueNode.from, to: qualiferValueNode.to }
				})
			};
		}
	}

	let from = 0;
	let to = query.length;

	/**
	 * Adjust `from` and `to` if enclosed qualifiers or groups are found BEFORE the edited part
	 * */
	tree.iterate({
		from: 0,
		to: cursor,
		enter(node) {
			if (node.type.is('Qualifier') || node.type.is('Group') || node.type.is('BooleanOperator')) {
				if (node.to > cursor) {
					from = node.from;
					to = node.to;
				} else {
					from = node.to;
				}
			}
		}
	});

	/**
	 * Adjust `from` and `to` if enclosed qualifiers or groups are found AFTER the edited part
	 * */
	tree.iterate({
		from,
		to,
		enter(node) {
			if (
				(node.type.is('Qualifier') || node.type.is('Group') || node.type.is('BooleanOperator')) &&
				node.from > cursor &&
				node.from < to
			) {
				to = node.from;
			}
		}
	});

	return { from, to };
}

export default getEditedRanges;
