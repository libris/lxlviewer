import type { SearchResult } from '$lib/types/search';
import { relativizeUrl } from '$lib/utils/http';

function getAdjecentResults({
	searchResult,
	fnurgel,
	uidPrefix
}: {
	searchResult?: SearchResult;
	fnurgel: string;
	uidPrefix?: string;
}):
	| {
			prev: string | undefined;
			next: string | undefined;
			relativeOffset: number;
			absoluteOffset: number;
			findAnchorLink: string | undefined;
	  }
	| undefined {
	if (searchResult) {
		const relativeOffset = searchResult.items.findIndex((item) => item['@id'].includes(fnurgel));
		const absoluteOffset = searchResult.itemOffset + (relativeOffset || 0);

		if (typeof relativeOffset === 'number' && relativeOffset >= 0) {
			const prev =
				absoluteOffset !== 0
					? relativeOffset > 0 // check if part of fetched search results
						? relativizeUrl(searchResult.items[relativeOffset - 1]['@id'])
						: undefined // TODO: return or use promise fetch which can be used to get previous search results (which should include previous result item)
					: undefined;

			const next =
				absoluteOffset < searchResult.totalItems - 1
					? relativeOffset >= 0 && relativeOffset < searchResult.itemsPerPage - 1 // check if part of fetched search results
						? relativizeUrl(searchResult.items[relativeOffset + 1]['@id'])
						: undefined //TODO: return or use promise fetch which can be used to get next search results (which should include next result item)
					: undefined;

			const findAnchorLink = `${relativizeUrl(searchResult['@id'])}#${uidPrefix}${fnurgel}`;
			return { prev, next, relativeOffset, absoluteOffset, findAnchorLink };
		}
	}
	return undefined;
}

export default getAdjecentResults;
