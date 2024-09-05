import type { EditedRange } from '$lib/components/CodeMirror.svelte';

const QUALIFIER_REGEX = RegExp(/((")?[0-9a-zA-ZaåöAÅÖ:]+\2):((")?[0-9a-zA-ZaåöAÅÖ:]+\4?)?/);
const PHRASE_REGEX = RegExp(/(^|\s)((")?[0-9a-zA-ZaåöAÅÖ:]+\3:(")?[0-9a-zA-ZaåöAÅÖ:]+\4?)(\s?|$)/);

/**
 * Gets the edited parts of a query the cursor position.
 */

function getEditedParts({ q, cursor }: { q: string; cursor: number }): {
	word: string; // a single word/string (e.g. Astrid)
	wordRange: EditedRange;
	phrase: string | null; // a group of words/strings (e.g. Astrid Lindgren)
	phraseRange: EditedRange | null;
	qualifierLikeName: string | null; // a string that could be a valid qualifier name
	qualifierLikeValue: string | null; // a string that could be the value of a valid qualifier
} {
	const wordFromIndex = q.lastIndexOf(q.slice(0, cursor).split(/\s+/).pop()!);
	const wordToIndex = cursor + q.slice(cursor).split(/\s+/)[0].length || 0;
	const word = q.slice(wordFromIndex, wordToIndex);
	const wordRange = { from: wordFromIndex, to: wordToIndex };

	const qualifierMatch = word.match(QUALIFIER_REGEX);

	if (qualifierMatch) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [match, name, delimiter, value] = qualifierMatch;

		return {
			word,
			wordRange,
			phrase: null,
			phraseRange: null,
			qualifierLikeName: name,
			qualifierLikeValue: value || null
		};
	} else {
		const phraseBefore = q.slice(0, cursor).split(PHRASE_REGEX).pop() || ''; // get last string before cursor which isn't a qualifier
		const phraseAfter = q.slice(cursor).split(PHRASE_REGEX)?.[0] || ''; // get first string after cursor which isn't a qualifier

		const phrase = phraseBefore + phraseAfter;
		const phraseFrom = q.slice(0, cursor).lastIndexOf(phraseBefore);
		const phraseTo = phraseFrom + phrase.length;
		const phraseRange = { from: phraseFrom, to: phraseTo };

		return {
			word,
			wordRange,
			phrase: (phrase !== word && phrase) || null,
			phraseRange: (phrase !== word && phraseRange) || null,
			qualifierLikeName: null,
			qualifierLikeValue: null
		};
	}
}

export default getEditedParts;
