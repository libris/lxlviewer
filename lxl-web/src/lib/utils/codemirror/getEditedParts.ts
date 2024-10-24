import type { EditedRange } from '$lib/components/CodeMirror.svelte';

/**
 * qualifierType = preceded by a whitespace or beginning; allowed chars in quotes or no quotes :
 * qualifierValue = captures up until blankspace or end quote
 */
const QUALIFIER_REGEX =
	/(?<=^|\s)(?<qualifierType>("[0-9a-zA-ZåäöÅÄÖ:]+")|([0-9a-zA-ZåäöÅÄÖ:]+)):(?<qualifierValue>("[^"]*"|[0-9a-zA-ZåäöÅÄÖ:%#".-]+))/;

/**
 * Gets the edited parts of a query the cursor position.
 */

function getEditedParts({ value, cursor }: { value: string; cursor: number }): {
	word: string; // a single word/string (e.g. Astrid)
	wordRange: EditedRange;
	phrase: string | null; // a group of words/strings (e.g. Astrid Lindgren)
	phraseRange: EditedRange | null;
	qualifierType: string | undefined | null;
	qualifierValue: string | undefined | null;
} {
	// word start = last whitespace not in quote from start to cursor
	const wordFromIndex = whiteSpacesOutsideOfQuotes(value.slice(0, cursor)).pop() || 0;

	// word end = first whitespace not in quote from word start to end
	const wordToIndex =
		wordFromIndex +
		(whiteSpacesOutsideOfQuotes(value.slice(wordFromIndex)).shift() || value.length);

	const word = value.slice(wordFromIndex, wordToIndex).trim();
	const wordRange = { from: wordFromIndex, to: wordToIndex };

	const qualifierMatch = word.match(RegExp(QUALIFIER_REGEX));

	if (qualifierMatch) {
		const { qualifierType, qualifierValue } = qualifierMatch.groups || {};

		return {
			word,
			wordRange,
			phrase: null,
			phraseRange: null,
			qualifierType,
			qualifierValue
		};
	} else {
		const valueBefore = value.slice(0, cursor);
		const allQualifiersBefore = valueBefore.matchAll(RegExp(QUALIFIER_REGEX, 'g'));
		let qualifierBefore = null;
		[...allQualifiersBefore].forEach((q) => (qualifierBefore = q[0]));
		const phraseBefore = valueBefore.split(qualifierBefore).pop() || valueBefore;

		const valueAfter = value.slice(cursor);
		const qualifierAfter = valueAfter.match(RegExp(QUALIFIER_REGEX))?.[0] || null;
		const phraseAfter = valueAfter.split(qualifierAfter).shift() || valueAfter;

		const phrase = (phraseBefore + phraseAfter).trim();
		const phraseFromIndex = valueBefore.lastIndexOf(phraseBefore.trim());
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
 * Returns the index positions of whitespace outside of quotes in a string
 */
function whiteSpacesOutsideOfQuotes(str: string) {
	const resultArr = [];
	let inQuotes = false;

	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (/\s/.test(char) && !inQuotes) {
			if (i > 0) {
				// ignore opening whitespace
				resultArr.push(i);
			}
		}
	}
	return resultArr;
}

export default getEditedParts;
