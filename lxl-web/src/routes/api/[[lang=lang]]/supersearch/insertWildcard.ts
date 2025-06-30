import { lxlQuery } from 'codemirror-lang-lxlquery';

/**
 * Insert a * (to get initial suggestions) if qualifier value is an empty quote or group
 */
function insertWildcard(query: string, cursor: number) {
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

	if (qualifierValueNode) {
		const valueNodeText = query.slice(qualifierValueNode.from, qualifierValueNode.to).trim();
		if (valueNodeText === '""' || valueNodeText === '()') {
			return {
				query:
					query.slice(0, qualifierValueNode.from + 1) +
					'*' +
					query.slice(qualifierValueNode.to - 1),
				cursor: cursor + 1
			};
		}
	}
	return { query, cursor };
}

export default insertWildcard;
