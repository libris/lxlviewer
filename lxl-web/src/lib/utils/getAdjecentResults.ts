import type { SearchResult } from '$lib/types/search';
import { relativizeUrl } from '$lib/utils/http';

function getAdjecentResults({
	searchResult,
	fnurgel
	// uidPrefix
}: {
	searchResult?: SearchResult;
	fnurgel: string;
	uidPrefix?: string;
}):
	| {
			relativeOffset: number;
			absoluteOffset: number;
			previousResultItem: string | undefined;
			nextResultItem: string | undefined;
			searchResult: string | undefined;
			previousSearchResult: string | undefined;
			nextSearchResult: string | undefined;
	  }
	| undefined {
	if (searchResult) {
		const relativeOffset = searchResult.items.findIndex((item) => item['@id'].includes(fnurgel));
		const absoluteOffset = searchResult.itemOffset + (relativeOffset || 0);

		if (typeof relativeOffset === 'number' && relativeOffset >= 0) {
			return {
				relativeOffset,
				absoluteOffset,
				previousResultItem:
					absoluteOffset !== 0
						? relativeOffset > 0 // check if part of fetched search results
							? relativizeUrl(searchResult.items[relativeOffset - 1]['@id'])
							: undefined
						: undefined,
				nextResultItem:
					absoluteOffset < searchResult.totalItems - 1
						? relativeOffset >= 0 && relativeOffset < searchResult.itemsPerPage - 1 // check if part of fetched search results
							? relativizeUrl(searchResult.items[relativeOffset + 1]['@id'])
							: undefined
						: undefined,
				searchResult: `${relativizeUrl(searchResult['@id'])}`, // temporarily remove hash until hash navigation bug is fixed
				previousSearchResult:
					searchResult.previous && searchResult['@id'] !== searchResult.first['@id']
						? relativizeUrl(searchResult.previous['@id'])
						: undefined,
				nextSearchResult:
					searchResult.next && searchResult['@id'] !== searchResult.last['@id']
						? relativizeUrl(searchResult.next['@id'])
						: undefined
			};
		}
	}
	return undefined;
}

export default getAdjecentResults;
