import { type FramedData, JsonLd } from '$lib/types/xl';
import { asArray, first, VocabUtil } from '$lib/utils/xl';

export type TypeLike = { find: FramedData[]; identify: FramedData[]; select: FramedData[] };

// TODO this is just a temporary implementation for exploring different ways of displaying categories
function getTypeLike(thing: FramedData, vocabUtil: VocabUtil): TypeLike {
	const result: TypeLike = {
		find: [],
		identify: [],
		select: []
	};

	if (thing[JsonLd.TYPE] != 'Monograph') {
		result.find.push(vocabUtil.getDefinition(thing[JsonLd.TYPE] as string));
	}

	if (thing._categoryByCollection) {
		const find: FramedData[] = thing._categoryByCollection['find'] || [];
		const identify = thing._categoryByCollection['identify'] || [];

		result.find.push(...find);
		result.identify.push(...identify);

		//const select = [...new Set(getAtPath(thing, ['@reverse', 'instanceOf', '*', 'category'], []))];
		//result.select.push(...select);
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

// TODO this is just a temporary implementation for exploring different ways of displaying categories
export function getTypeForIcon(typeLike: TypeLike) {
	if (typeLike.identify.find((t) => slug(t[JsonLd.ID]) === 'Audiobook')) {
		return 'Audiobook';
	}

	return typeLike.find.length > 0 ? slug(typeLike.find[0][JsonLd.ID]) : '';
}

function slug(s: string) {
	return s === undefined ? undefined : s.split('/').pop();
}
