import type { EditedRange } from '$lib/components/CodeMirror.svelte';

const QUALIFIER_REGEX = RegExp(/((")?[0-9a-zA-ZaåöAÅÖ:]+\2):((")?[0-9a-zA-ZaåöAÅÖ:]+\4?)?/);
const PHRASE_REGEX = RegExp(/(^|\s)((")?[0-9a-zA-ZaåöAÅÖ:]+\3:(")?[0-9a-zA-ZaåöAÅÖ:]+\4?)(\s?|$)/);

/**
 * Gets the edited parts of a query the cursor position.
 */

function getEditedParts({ value, cursor }: { value: string; cursor: number }): {
	word: string; // a single word/string (e.g. Astrid)
	wordRange: EditedRange;
	phrase: string | null; // a group of words/strings (e.g. Astrid Lindgren)
	phraseRange: EditedRange | null;
} {
	const wordFromIndex = value.lastIndexOf(value.slice(0, cursor).split(/\s+/).pop()!);
	const wordToIndex = cursor + value.slice(cursor).split(/\s+/)[0].length || 0;
	const word = value.slice(wordFromIndex, wordToIndex);
	const wordRange = { from: wordFromIndex, to: wordToIndex };

	const qualifierMatch = word.match(QUALIFIER_REGEX);

	if (qualifierMatch) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [match, name, delimiter, value] = qualifierMatch;

		return {
			word,
			wordRange,
			phrase: null,
			phraseRange: null
		};
	} else {
		const phraseBefore = value.slice(0, cursor).split(PHRASE_REGEX).pop() || ''; // get last string before cursor which isn't a qualifier
		const phraseAfter = value.slice(cursor).split(PHRASE_REGEX)?.[0] || ''; // get first string after cursor which isn't a qualifier
		const phrase = (phraseBefore + phraseAfter).trim();
		const phraseFromIndex = value.slice(0, cursor).lastIndexOf(phraseBefore.trim());
		const phraseToIndex = phraseFromIndex + phrase.length;
		const phraseRange = { from: phraseFromIndex, to: phraseToIndex };

		return {
			word,
			wordRange,
			phrase: (phrase !== word && phrase) || null,
			phraseRange: (phrase !== word && phraseRange) || null
		};
	}
}

export default getEditedParts;