import { Bibframe, type FramedData, JsonLd } from '$lib/types/xl';
import { VocabUtil } from '$lib/utils/xl.server';
import getAtPath from '$lib/utils/getAtPath';

export type TypeLike = {
	find: FramedData[];
	identify: FramedData[];
	none: FramedData[];
	select: FramedData[];
};

export const COMPONENT_PART = 'https://id.kb.se/term/saobf/ComponentPart';

const PRINT = 'https://id.kb.se/term/saobf/Print';
const VOLUME = 'https://id.kb.se/term/rda/Volume';
const E_BOOK = 'https://id.kb.se/term/saobf/EBook';
const ONLINE_RESOURCE = 'https://id.kb.se/term/rda/OnlineResource';
const STORSTIL = 'https://id.kb.se/marc/LargePrint';
const BRAILLE = 'https://id.kb.se/term/saobf/Braille';
const _BOOK = 'ls:book';
const _BOOK_BRAILLE = 'ls:bookBraille';

const SKON = 'https://id.kb.se/term/saogf/Sk%C3%B6nlitteratur';
const FACK = 'https://id.kb.se/term/saogf/Facklitteratur';
const BARN_UNGDOM = 'https://id.kb.se/term/barngf/Barn-%20och%20ungdomslitteratur';

const INSTANCE_RULES = [
	{
		matchWorkType: 'Monograph',
		match: [PRINT, VOLUME],
		to: [_BOOK]
	},
	{
		matchWorkType: 'Monograph',
		match: [BRAILLE, VOLUME],
		to: [_BOOK_BRAILLE]
	},
	{
		match: [E_BOOK, ONLINE_RESOURCE],
		to: [E_BOOK]
	},
	{
		match: [E_BOOK, VOLUME],
		to: [E_BOOK]
	},
	{
		match: [ONLINE_RESOURCE, VOLUME],
		to: [ONLINE_RESOURCE]
	},
	{
		match: [_BOOK, STORSTIL],
		to: [STORSTIL]
	},
	{
		match: [COMPONENT_PART, PRINT],
		to: [COMPONENT_PART]
	}
];

const WORK_INSTANCES_RULES = [
	{
		match: [E_BOOK, ONLINE_RESOURCE],
		to: [E_BOOK]
	},
	{
		match: [_BOOK, PRINT],
		to: [_BOOK]
	}
];

const FIND_RULES = [
	{
		match: [BARN_UNGDOM, SKON],
		to: [BARN_UNGDOM]
	},
	{
		match: [BARN_UNGDOM, FACK],
		to: [BARN_UNGDOM]
	}
];

const DEFS = {
	[_BOOK]: {
		[JsonLd.TYPE]: 'ManifestationForm',
		[JsonLd.ID]: '_book',
		prefLabelByLang: {
			en: 'Book',
			sv: 'Bok'
		}
	},
	[_BOOK_BRAILLE]: {
		[JsonLd.TYPE]: 'ManifestationForm',
		[JsonLd.ID]: '_book_braille',
		prefLabelByLang: {
			en: 'Book (braille)',
			sv: 'Bok (punktskrift)'
		}
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

	const thingType = thing[JsonLd.TYPE];

	if (thingType != 'Monograph' && thingType != 'Serial') {
		result.find.push(vocabUtil.getDefinition(thingType));
	}

	if (thing._categoryByCollection) {
		//const find: FramedData[] = thing._categoryByCollection['find'] || [];
		const findMapA = (thing._categoryByCollection['find'] || []).reduce((a, s) => {
			a[s[JsonLd.ID]] = s;
			return a;
		}, {});
		const findMapB = cleanUpCategories(findMapA, null, FIND_RULES);
		const find = Object.values(findMapB);

		const identify = thing._categoryByCollection['identify'] || [];
		const none = thing._categoryByCollection[JsonLd.NONE] || [];

		result.find.push(...find);
		result.identify.push(...identify);
		result.none.push(...none);

		// FIXME
		const isSingleInstance = thingType === 'PhysicalResource' || thingType === 'DigitalResource';

		const workType = isSingleInstance ? thing[Bibframe.instanceOf]?.[JsonLd.TYPE] : thingType;

		const instances = isSingleInstance
			? [thing]
			: getAtPath(thing, ['@reverse', 'instanceOf', '*'], []);

		let selectMap = instances
			.map((i: FramedData) => getAtPath(i, ['_categoryByCollection', JsonLd.NONE], []))
			.map((ss: FramedData[]) =>
				ss.reduce((a, s) => {
					a[s[JsonLd.ID]] = s;
					return a;
				}, {})
			)
			.map((s: Record<string, FramedData>) =>
				toMultiType(cleanUpCategories(s, workType, INSTANCE_RULES))
			)
			.reduce((acc, s) => {
				Object.keys(s).forEach((k) => {
					acc[k] = s[k];
				});
				return acc;
			}, {});

		// when we display instance categories for multiple works together
		// there might be a mix of Book and Print which looks messy -> drop Print etc. etc.
		selectMap = cleanUpCategories(selectMap, workType, WORK_INSTANCES_RULES);

		const select = Object.values(selectMap);

		result.select.push(...select);
	}

	return result;
}

function cleanUpCategories(s: Record<string, FramedData>, workType: string | null, rules) {
	for (const rule of rules) {
		if (rule.matchWorkType && workType !== rule.matchWorkType) {
			continue;
		}

		if (rule.match.every((c) => c in s)) {
			rule.match.forEach((c) => {
				if (!rule.to.includes(c)) {
					delete s[c];
				}
			});
			rule.to.forEach((c) => {
				if (!(c in s)) {
					s[c] = DEFS[c];
				}
			});
		}
	}

	return s;
}

function toMultiType(s: Record<string, FramedData>) {
	if (Object.keys(s).length <= 1) {
		return s;
	}

	const key = Object.keys(s).sort().join();
	const value = {
		'@type': '_MultipleTypes',
		_select: Object.values(s)
	};

	return { [key]: value };
}

export function toTypes(typeLike: TypeLike) {
	const noIdentify = typeLike.identify.length == 0;
	const noFind = typeLike.find.length == 0;
	const manyFind = typeLike.find.length > 1;
	const typeInFind = !noFind && typeLike.find[0][JsonLd.TYPE] === 'Class';
	const showFind = manyFind || typeInFind || (!noFind && noIdentify);
	//const showFind = !noFind && noIdentify;
	const showNone = noFind && noIdentify && typeLike.none.length > 0;

	return {
		'@type': '_Types',
		...(showFind && { _find: typeLike.find }),
		...(!noIdentify && { _identify: typeLike.identify }),
		...(showNone && { _none: typeLike.none })
	};
}

export default getTypeLike;

// TODO this is just a temporary implementation for exploring different ways of displaying categories
export function getTypeForIcon(typeLike: TypeLike) {
	const result = [];
	for (const t of typeLike.identify
		.concat(typeLike.find)
		.concat(typeLike.select)
		.concat(typeLike.none)) {
		if (t) {
			const slugStr = slug(((t[JsonLd.ID] as string) || '').replace('/bibdb/', '/bibdb:'));
			result.push(slugStr);
		}
	}
	return result.filter((t) => !!t);
}

export function getSelectSlug(thing: FramedData, vocabUtil: VocabUtil): string {
	const typeLike = getTypeLike(thing, vocabUtil);
	return slug(typeLike.select?.[0][JsonLd.ID] as string);
}

export function slug(s: string) {
	return s === undefined ? '' : s.split('/').pop() || '';
}
