import type { QualifiersResponse } from '$lib/types/autocomplete';
import { linter, type Diagnostic } from '@codemirror/lint';
/**
 * CodeMirror extension which lints qualifiers
 */

const qualifierLinter = (validQualifiers: QualifiersResponse) =>
	linter(async (view) => {
		const q = view.state.doc.toString();

		const validQualifierNames = Object.keys(validQualifiers);

		const usedQualifierRegExpExecs = [
			...q.matchAll(
				/(?<!\S+)((")?[0-9a-zA-ZaåöAÅÖ:]+\2):/g // regex probalby needs modification
			)
		];

		const diagnostics: Diagnostic[] = [];

		usedQualifierRegExpExecs?.forEach((regExpExecItem) => {
			const [match, name] = regExpExecItem;
			if (!validQualifierNames.includes(name)) {
				diagnostics.push({
					from: regExpExecItem.index,
					to: regExpExecItem.index + match.length,
					severity: 'error',
					message: 'Okänd egenskap'
				});
			}
		});

		return diagnostics;
	});

export default qualifierLinter;
