import { lxlQuery } from 'codemirror-lang-lxlquery';

/**
 * Adds an ending space after the query string if it ends with a qualifier (to mitigate the problem with unintentionally edited qualifiers without ending quote characters).
 */

function addSpaceIfEndingQualifier(q: string) {
	const tree = lxlQuery.language.parser.parse(q);
	const lastNode = tree.resolveInner(q.length, -1);

	if (lastNode.parent?.name === 'QualifierValue') {
		return q + ' ';
	}

	return q;
}

export default addSpaceIfEndingQualifier;
