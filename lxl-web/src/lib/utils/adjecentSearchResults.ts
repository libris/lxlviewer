import type { SearchResult, PartialCollectionView } from '$lib/types/search';
import type { AdjecentSearchResult } from '$lib/types/search';
import { relativizeUrl, stripAnchor } from '$lib/utils/http';

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

export function getPreviousItemFnurgel(
	adjecentSearchResults?: AdjecentSearchResult[],
	searchResultIndex?: number,
	itemIndex?: number
): string | undefined {
	if (
		adjecentSearchResults &&
		typeof searchResultIndex === 'number' &&
		typeof itemIndex === 'number'
	) {
		/** if previous fnurgel is part of current search result, get fnurgel from previous item */
		if (itemIndex > 0) {
			return stripAnchor(
				relativizeUrl(adjecentSearchResults[searchResultIndex].items[itemIndex - 1]['@id'])
			);
		}
		/** otherwise get previous fnurgel from last item of previous search result */
		if (searchResultIndex > 0 && itemIndex === 0) {
			return stripAnchor(
				relativizeUrl(
					adjecentSearchResults[searchResultIndex - 1].items[
						adjecentSearchResults[searchResultIndex - 1].items.length - 1
					]['@id']
				)
			);
		}
	}
	return undefined;
}

export function getNextItemFnurgel(
	adjecentSearchResults?: AdjecentSearchResult[],
	searchResultIndex?: number,
	itemIndex?: number
): string | undefined {
	if (
		adjecentSearchResults &&
		typeof searchResultIndex === 'number' &&
		typeof itemIndex === 'number'
	) {
		/** if next fnurgel is part of current search result, get fnurgel from next item*/
		if (itemIndex >= 0 && itemIndex < adjecentSearchResults[searchResultIndex].items.length - 1) {
			return stripAnchor(
				relativizeUrl(adjecentSearchResults[searchResultIndex].items[itemIndex + 1]['@id'])
			);
		}
		/** otherwise get next fnurgel from first item of next search result */
		if (
			searchResultIndex >= 0 &&
			itemIndex === adjecentSearchResults[searchResultIndex]?.items.length - 1
		) {
			return stripAnchor(
				relativizeUrl(adjecentSearchResults[searchResultIndex + 1]?.items?.[0]['@id'])
			);
		}
	}
	return undefined;
}
