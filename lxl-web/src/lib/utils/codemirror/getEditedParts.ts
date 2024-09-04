const QUALIFIER_REGEX = RegExp(/((")?[0-9a-zA-ZaåöAÅÖ:]+\2):((")?[0-9a-zA-ZaåöAÅÖ:]+\4?)?/);
const PHRASE_REGEX = RegExp(/(")?[0-9a-zA-ZaåöAÅÖ:]+\1:(")?[0-9a-zA-ZaåöAÅÖ:]+\2?\s?|$/);

/**
 * Gets the edited parts of a query the cursor position.
 */

function getEditedParts({ q, cursor }: { q: string; cursor: number }): {
	word: string; // a single word/string (e.g. Astrid)
	phrase?: string; // a group of words/strings (e.g. Astrid Lindgren)
	qualifierLikeName?: string; // a string that could be a valid qualifier name
	qualifierLikeValue?: string; // a string that could be the value of a valid qualifier
} {
	const wordFromIndex = q.lastIndexOf(q.slice(0, cursor).split(/\s+/).pop()!);
	const wordToIndex = cursor + q.slice(cursor).split(/\s+/)[0].length || 0;

	const word = q.slice(wordFromIndex, wordToIndex);
	const qualifierMatch = word.match(QUALIFIER_REGEX);

	if (qualifierMatch) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [match, name, delimiter, value] = qualifierMatch;

		return {
			word,
			qualifierLikeName: name,
			qualifierLikeValue: value || ''
		};
	} else {
		const phraseBefore = q.slice(0, cursor).split(PHRASE_REGEX).pop() || ''; // get last string before cursor which isn't a qualifier
		const phraseAfter = q.slice(cursor).split(PHRASE_REGEX)?.[0] || ''; // get first string after cursor which isn't a qualifier

		return {
			word,
			phrase: phraseBefore + phraseAfter
		};
	}
}

export default getEditedParts;
