import { type FramedData, JsonLd } from '$lib/types/xl';
import { asArray, first, VocabUtil } from '$lib/utils/xl';

function getTypeLike(thing: FramedData, vocabUtil: VocabUtil): FramedData[] {
	const result = [];
	if (thing[JsonLd.TYPE] != 'Monograph') {
		result.push(vocabUtil.getDefinition(thing[JsonLd.TYPE] as string));
	}
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
	result.push(...categories);
	result.push(...other);
	result.push(...contentTypes);
	/*if (result.length === 0) {
		result.push(...contentType);
	}

	 */
	return result;
}

export default getTypeLike;
