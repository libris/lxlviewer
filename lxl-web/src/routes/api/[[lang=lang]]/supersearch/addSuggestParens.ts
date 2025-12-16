import { lxlQuery } from 'codemirror-lang-lxlquery';

/**
 * Check for empty qualifier values and add _mappingOnly to quickly get their label
 * (as long as empty searches are disallowed, transform () -> "")
 * for non-empty values instead apply _suggest
 */
function addSuggestParens(query: string, cursor: number) {
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
				_q: query.slice(0, qualifierValueNode.from) + '""' + query.slice(qualifierValueNode.to),
				cursor,
				_mappingOnly: 'true'
			};
		}
	}
	return {
		_q: query,
		cursor,
		_suggest: 'true'
	};
}

export default addSuggestParens;
