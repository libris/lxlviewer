import { type FramedData, JsonLd } from '$lib/types/xl';
import { asArray, first, VocabUtil } from '$lib/utils/xl';

function getTypeLike(thing: FramedData, vocabUtil: VocabUtil): FramedData[] {
	const result = [];
	if (thing[JsonLd.TYPE] != 'Monograph') {
		result.push(vocabUtil.getDefinition(thing[JsonLd.TYPE] as string));
	}
	const contentType: FramedData[] = [];
	(asArray(thing.category) as FramedData[]).forEach((category) => {
		if (first(asArray(category[JsonLd.TYPE])) === 'ContentType') {
			contentType.push(category);
		} else {
			result.push(category);
		}
	});
	if (result.length === 0) {
		result.push(...contentType);
	}
	return result;
}

export default getTypeLike;
