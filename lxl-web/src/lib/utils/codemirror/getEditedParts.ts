import type { EditedRange } from '$lib/components/CodeMirror.svelte';

// const QUALIFIER_REGEX = RegExp(/((")?[0-9a-zA-ZåäöÅÄÖ:]+\2):((")?[0-9a-zA-ZåäöÅÄÖ:%#-.]+\4?)?/);

const QUALIFIER_REGEX = RegExp(
	/^([0-9a-zA-ZåäöÅÄÖ:]*?):\s*(".*?"|[^"\s]+)(?:\s+[0-9a-zA-ZåäöÅÄÖ:%#-.]*)?$/
);
const PHRASE_REGEX = RegExp(/(^|\s)((")?[0-9a-zA-ZåäöÅÄÖ:]+\3:(")?[0-9a-zA-ZåäöÅÄÖ:%#-.]+\4?)/);

/**
 * Gets the edited parts of a query the cursor position.
 */

function getEditedParts({ value, cursor }: { value: string; cursor: number }): {
	word: string; // a single word/string (e.g. Astrid)
	wordRange: EditedRange;
	phrase: string | null; // a group of words/strings (e.g. Astrid Lindgren)
	phraseRange: EditedRange | null;
	qualifierType: string | null;
	qualifierValue: string | null;
} {
	// word start = last blankspace not in quote from start to cursor
	const wordFromIndex = blankSpacesOutsideOfQuotes(value.slice(0, cursor)).pop() || 0;

	// word end = first blankspace not in quote from word start to end
	const wordToIndex =
		wordFromIndex +
		(blankSpacesOutsideOfQuotes(value.slice(wordFromIndex)).shift() || value.length);

	const word = value.slice(wordFromIndex, wordToIndex).trim();
	const wordRange = { from: wordFromIndex, to: wordToIndex };

	const qualifierMatch = word.match(QUALIFIER_REGEX);

	if (qualifierMatch) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [match, qualifierType, qualifierValue] = qualifierMatch;

		return {
			word,
			wordRange,
			phrase: null,
			phraseRange: null,
			qualifierType,
			qualifierValue
		};
	} else {
		// todo: phrases does not yet take quotations in qualifiers into account
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
			phraseRange: (phrase !== word && phraseRange) || null,
			qualifierType: null,
			qualifierValue: null
		};
	}
}

/**
 * Returns the index positions of blank spaces outside of quotes in a string
 */
function blankSpacesOutsideOfQuotes(str: string) {
	const resultArr = [];
	let inQuotes = false;

	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === ' ' && !inQuotes) {
			if (i > 0) {
				// ignore opening whitespace
				resultArr.push(i);
			}
		}
	}
	return resultArr;
}

export default getEditedParts;
