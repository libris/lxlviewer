import { type FramedData, JsonLd } from '$lib/types/xl';
import { asArray, first, VocabUtil } from '$lib/utils/xl';
import getAtPath from '$lib/utils/getAtPath';

export type TypeLike = {
	find: FramedData[];
	identify: FramedData[];
	none: FramedData[];
	select: FramedData[];
};

const PRINT = 'https://id.kb.se/term/saobf/Print';
const VOLUME = 'https://id.kb.se/term/rda/Volume';
const E_BOOK = 'https://id.kb.se/term/saobf/EBook';
const ONLINE_RESOURCE = 'https://id.kb.se/term/rda/OnlineResource';
const STORSTIL = 'https://id.kb.se/marc/LargePrint';
const BRAILLE = 'https://id.kb.se/term/saobf/Braille';
const COMPONENT_PART = 'https://id.kb.se/term/saobf/ComponentPart';
const _BOOK = 'ls:book';
const _BOOK_BRAILLE = 'ls:bookBraille';

const _BOOK_DEF: FramedData = {
	[JsonLd.TYPE]: 'ManifestationForm',
	prefLabelByLang: {
		en: 'Book',
		sv: 'Bok'
	}
};

const _BOOK_BRAILLE_DEF: FramedData = {
	[JsonLd.TYPE]: 'ManifestationForm',
	prefLabelByLang: {
		en: 'Book (braille)',
		sv: 'Bok (punktskrift)'
	}
};

// TODO this is just a temporary implementation for exploring different ways of displaying categories
function getTypeLike(thing: FramedData, vocabUtil: VocabUtil): TypeLike {
	const result: TypeLike = {
		find: [],
		identify: [],
		none: [],
		select: []
	};

	if (thing[JsonLd.TYPE] != 'Monograph') {
		result.find.push(vocabUtil.getDefinition(thing[JsonLd.TYPE] as string));
	}

	if (thing._categoryByCollection) {
		const find: FramedData[] = thing._categoryByCollection['find'] || [];
		const identify = thing._categoryByCollection['identify'] || [];
		const none = thing._categoryByCollection[JsonLd.NONE] || [];

		result.find.push(...find);
		result.identify.push(...identify);
		result.none.push(...none);

		const instances = getAtPath(thing, ['@reverse', 'instanceOf', '*'], []);

		let selectMap = instances
			.map((i: FramedData) => getAtPath(i, ['_categoryByCollection', JsonLd.NONE], []))
			.map((ss: FramedData[]) =>
				ss.reduce((a, s) => {
					a[s[JsonLd.ID]] = s;
					return a;
				}, {})
			)
			.map((s: Record<string, FramedData>) => toMultiType(cleanUpInstanceSelect(s, thing)))
			.reduce((acc, s) => {
				Object.keys(s).forEach((k) => {
					acc[k] = s[k];
				});
				return acc;
			}, {});

		selectMap = cleanUpWorkSelect(selectMap);

		const select = Object.values(selectMap);

		result.select.push(...select);
	} else {
		const contentTypes: FramedData[] = [];
		const categories: FramedData[] = [];
		const other: FramedData[] = [];
		(asArray(thing.category) as FramedData[]).forEach((category) => {
			if (first(asArray(category[JsonLd.TYPE])) === 'Category') {
				categories.push(category);
			} else if (first(asArray(category[JsonLd.TYPE])) === 'ContentType') {
				contentTypes.push(category);
			} else {
				other.push(category);
			}
		});
		result.find.push(...categories);
		result.identify.push(...other);
		result.identify.push(...contentTypes);

		/*if (result.find.length === 0 && result.identify.length === 0) {
		    result.find.push(...contentType);
	    }
	    */
	}

	return result;
}

function cleanUpInstanceSelect(s: Record<string, FramedData>, thing: FramedData) {
	if (thing[JsonLd.TYPE] == 'Monograph' && s[PRINT] && s[VOLUME]) {
		delete s[PRINT];
		delete s[VOLUME];
		s[_BOOK] = _BOOK_DEF;
	}

	if (thing[JsonLd.TYPE] == 'Monograph' && s[BRAILLE] && s[VOLUME]) {
		delete s[BRAILLE];
		delete s[VOLUME];
		s[_BOOK_BRAILLE] = _BOOK_BRAILLE_DEF;
	}

	if (s[E_BOOK] && s[ONLINE_RESOURCE]) {
		delete s[ONLINE_RESOURCE];
	}

	if (s[_BOOK] && s[STORSTIL]) {
		delete s[_BOOK];
	}

	if (s[COMPONENT_PART] && s[PRINT]) {
		delete s[PRINT];
	}

	return s;
}

function cleanUpWorkSelect(s: Record<string, FramedData>) {
	if (s[E_BOOK] && s[ONLINE_RESOURCE]) {
		delete s[ONLINE_RESOURCE];
	}

	if (s[_BOOK] && s[PRINT]) {
		delete s[PRINT];
	}
	return s;
}

function toMultiType(s: Record<string, FramedData>) {
	if (Object.keys(s).length <= 1) {
		return s;
	}

	const key = Object.keys(s).sort().join();
	const value = {
		'@type': '_MultiTypes',
		_select: Object.values(s)
	};

	return { [key]: value };
}

export default getTypeLike;

const PRIORITIZED_ICONS = [
	'Audiobook',
	'NotatedMusic',
	'Ljudb%C3%B6cker',
	'Kit',
	'Databaser',
	'Periodika',
	'Kartor',
	'Kartglober'
];

// TODO this is just a temporary implementation for exploring different ways of displaying categories
export function getTypeForIcon(typeLike: TypeLike) {
	for (const t of typeLike.identify.concat(typeLike.find)) {
		if (t) {
			const slugStr = slug(t[JsonLd.ID]);
			if (slugStr && PRIORITIZED_ICONS.includes(slugStr)) {
				return slugStr;
			}
		}
	}

	return typeLike.find.length > 0 && typeLike.find[0] !== undefined
		? slug(typeLike.find[0][JsonLd.ID])
		: '';
}

export function slug(s: string) {
	return s === undefined ? undefined : s.split('/').pop();
}

export function bookAspectRatio(iconTypeStr: string) {
	return (
		iconTypeStr &&
		[
			'Literature',
			'Ej%20sk%C3%B6nlitteratur',
			'Facklitteratur',
			'Sk%C3%B6nlitteratur',
			'Barn-%20och%20ungdomslitteratur',
			'Text',
			'Periodika',
			'NotatedMusic'
		].includes(iconTypeStr)
	);
}
