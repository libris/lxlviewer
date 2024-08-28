import { linter, type Diagnostic } from '@codemirror/lint';
import getValidQualifiers from './getValidQualifiers';
import type { Qualifier } from '$lib/types/qualifier';
/**
 * CodeMirror extension which lints qualifiers
 */

const qualifierLinter = linter(async (view) => {
	const q = view.state.doc.toString();

	const qualifiersRes = await fetch('/api/autocomplete/qualifiers');
	const qualifiers = (await qualifiersRes.json()) as Qualifier[];

	const usedQualifierMatches = [
		...q.matchAll(
			/(?<!\S+)([0-9a-zA-ZaåöAÅÖ]+):((")?[0-9a-zA-ZaåöAÅÖ:]+\3?)?/g // regex probalby needs modification
		)
	];

	const usedQualifiers = usedQualifierMatches.map((item) => {
		const [match, name, value] = item;
		return { name, value, range: { from: item.index, to: match.length + item.index } };
	});

	const { invalid: invalidQualifiers } = await getValidQualifiers(qualifiers, usedQualifiers);

	const diagnostics: Diagnostic[] = [];

	invalidQualifiers?.forEach((invalidQualifier) => {
		diagnostics.push({
			from: invalidQualifier.range.from,
			to: invalidQualifier.range.to,
			severity: 'error',
			message: 'Okänd egenskap/sökkod'
		});
	});

	return diagnostics;
});

export default qualifierLinter;
