/**
 * qualifierType = preceded by a whitespace or beginning; allowed chars in quotes or no quotes :
 * qualifierOperator = either : = > < >= <=
 * qualifierValue = captures up until blankspace or end quote
 */

const QUALIFIER_REGEX =
	/(?<=^|\s)(?<qualifierType>("[0-9a-zA-ZåäöÅÄÖ:]+")|([0-9a-zA-ZåäöÅÄÖ:]+))(?<qualifierOperator>([:=<>]|>=|<=))(?<qualifierValue>("[^"]*"|[0-9a-zA-ZåäöÅÄÖ:%#".-]+))$/;

function addSpaceIfEndingQualifier(q: string) {
	if (QUALIFIER_REGEX.test(q)) {
		return q + ' ';
	}
	return q;
}

export default addSpaceIfEndingQualifier;
