import { type FramedData, JsonLd } from '$lib/types/xl';
import { asArray, first, VocabUtil } from '$lib/utils/xl';
import getAtPath from '$lib/utils/getAtPath';

export type TypeLike = {
	find: FramedData[];
	identify: FramedData[];
	none: FramedData[];
	select: FramedData[];
};

const BAD_CARRIER_TYPES = ['https://id.kb.se/term/rda/OnlineResource'];

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

		const s = {};
		getAtPath(thing, ['@reverse', 'instanceOf', '*', '_categoryByCollection', JsonLd.NONE], [])
			.filter(
				(c: FramedData) =>
					c[JsonLd.TYPE] === 'ManifestationForm' ||
					(c[JsonLd.TYPE] === 'CarrierType' && !BAD_CARRIER_TYPES.includes(c[JsonLd.ID]))
			)
			.forEach((c: FramedData) => (s[c[JsonLd.ID]] = c));
		const select = Object.values(s);
		result.select.push(...select);
		//const select = [...new Set(getAtPath(thing, ['@reverse', 'instanceOf', '*', 'category'], []))];
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

export default getTypeLike;

const IDENTIFY_ICONS = ['Audiobook', 'NotatedMusic', 'Ljudb%C3%B6cker', 'Kit', 'Databaser'];

// TODO this is just a temporary implementation for exploring different ways of displaying categories
export function getTypeForIcon(typeLike: TypeLike) {
	for (const t of typeLike.identify) {
		if (t) {
			const slugStr = slug(t[JsonLd.ID]);
			if (slugStr && IDENTIFY_ICONS.includes(slugStr)) {
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
