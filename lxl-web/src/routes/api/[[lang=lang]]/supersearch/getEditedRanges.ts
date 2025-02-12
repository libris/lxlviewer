import { lxlQuery } from 'codemirror-lang-lxlquery';

type Range = {
	from: number;
	to: number;
};

export type EditedRanges = Range & {
	qualifierKey?: Range;
	qualifierOperator?: Range;
	qualifierValue?: Range;
};

function getEditedRanges(query: string, cursor: number): EditedRanges {
	const tree = lxlQuery.language.parser.parse(query);
	const innerNode = tree.resolveInner(cursor, -1);
	let qualifierValueNode = null;

	// check if innerNode is located somewhere within a QualifierValue
	let n: typeof innerNode.parent = innerNode;
	while (n) {
		if (n.type.is('QualifierValue')) {
			qualifierValueNode = n;
			break;
		} else {
			n = n?.parent;
		}
	}

	/**
	 * Return `from` and `to` from qualifier parts if editing qualifier value
	 */
	if (qualifierValueNode) {
		const qualifierNode = qualifierValueNode.parent;
		const qualifierKeyNode = qualifierNode?.getChild('QualifierKey');
		const qualifierOperatorNode = qualifierNode?.getChild('QualifierOperator');
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
				...(qualifierValueNode && {
					qualifierValue: { from: qualifierValueNode.from, to: qualifierValueNode.to }
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
			if (
				node.type.is('Qualifier') ||
				node.type.is('Group') ||
				node.type.is('AndOperator') ||
				node.type.is('OrOperator') ||
				node.type.is('NotOperator')
			) {
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
				(node.type.is('Qualifier') ||
					node.type.is('Group') ||
					node.type.is('AndOperator') ||
					node.type.is('OrOperator') ||
					node.type.is('NotOperator')) &&
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
