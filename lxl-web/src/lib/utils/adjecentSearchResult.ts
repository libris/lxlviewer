import type { SearchResult, PartialCollectionView } from '$lib/types/search';
import type { AdjecentSearchResult } from '$lib/types/search';

export function asAdjecentSearchResult(
	data: SearchResult | PartialCollectionView
): AdjecentSearchResult {
	const {
		'@id': id,
		itemOffset,
		itemsPerPage,
		totalItems,
		first,
		last,
		next,
		previous,
		items
	} = data;
	return {
		'@id': id,
		itemOffset,
		itemsPerPage,
		totalItems,
		first,
		last,
		next,
		previous,
		items: items.map(({ '@id': itemId }) => ({
			'@id': itemId as string
		}))
	};
}
