import type { ValidateQualifiersResponse } from '$lib/types/autocomplete';
import { linter, type Diagnostic } from '@codemirror/lint';
import sanitizeQSearchParamValue from '../sanitizeQSearchParamValue';
/**
 * CodeMirror extension which lints qualifiers
 */

const qualifierLinter = linter(async (view) => {
	const q = view.state.doc.toString();
	const sanitizedQ = sanitizeQSearchParamValue(q);
	const validateQualifiersRes = await fetch(
		`/api/autocomplete/validate-qualifiers?_q=${sanitizedQ}`
	);
	const qualifiers = (await validateQualifiersRes.json()) as ValidateQualifiersResponse;

	// const { invalid: invalidQualifiers } = await getValidQualifiers(qualifiers, usedQualifiers);
	const invalidQualifiers = qualifiers?.filter((item) => !item.valid);
	const diagnostics: Diagnostic[] = [];

	invalidQualifiers?.forEach((invalidQualifier) => {
		diagnostics.push({
			from: invalidQualifier.range.from,
			to: invalidQualifier.range.to,
			severity: 'error',
			message: 'Okänd egenskap'
		});
	});

	return diagnostics;
});

export default qualifierLinter;
