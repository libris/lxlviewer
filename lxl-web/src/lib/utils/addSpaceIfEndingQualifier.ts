import { lxlQuery } from 'codemirror-lang-lxlquery';

function addSpaceIfEndingQualifier(q: string) {
	const tree = lxlQuery.language.parser.parse(q);
	const lastNode = tree.resolveInner(q.length, -1);

	if (lastNode.parent?.name === 'QualifierValue') {
		return q + ' ';
	}

	return q;
}

export default addSpaceIfEndingQualifier;
