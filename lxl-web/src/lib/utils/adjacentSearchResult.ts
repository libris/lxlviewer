import { JsonLd } from '#lib/types/xl.js';
import type { SearchResult } from '#lib/types/search.js';
import type { AdjacentSearchResult } from '#lib/types/search.js';
import { relativizeUrl, stripAnchor, trimSlashes } from '#lib/utils/http.js';

export function asAdjacentSearchResult(data: SearchResult): AdjacentSearchResult {
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
		[JsonLd.ID]: id,
		itemOffset,
		itemsPerPage,
		totalItems,
		first,
		last,
		next,
		previous,
		items: items.map(({ [JsonLd.ID]: itemId }) => ({
			[JsonLd.ID]: itemId as string
		}))
	};
}

export function getPreviousItemFnurgel(
	adjacentSearchResults?: AdjacentSearchResult[],
	searchResultIndex?: number,
	itemIndex?: number
): string | undefined {
	if (
		adjacentSearchResults &&
		typeof searchResultIndex === 'number' &&
		typeof itemIndex === 'number'
	) {
		/** if previous fnurgel is part of current search result view, get fnurgel from previous item */
		if (itemIndex > 0) {
			return stripAnchor(
				trimSlashes(
					relativizeUrl(adjacentSearchResults[searchResultIndex].items[itemIndex - 1]['@id'])
				)
			);
		}
		/** otherwise get previous fnurgel from last item of previous search result view */
		if (searchResultIndex > 0 && itemIndex === 0) {
			return stripAnchor(
				trimSlashes(
					relativizeUrl(
						adjacentSearchResults[searchResultIndex - 1].items[
							adjacentSearchResults[searchResultIndex - 1].items.length - 1
						]['@id']
					)
				)
			);
		}
	}
	return undefined;
}

export function getNextItemFnurgel(
	adjacentSearchResults?: AdjacentSearchResult[],
	searchResultIndex?: number,
	itemIndex?: number
): string | undefined {
	if (
		adjacentSearchResults &&
		typeof searchResultIndex === 'number' &&
		typeof itemIndex === 'number'
	) {
		/** if next fnurgel is part of current search result view , get fnurgel from next item*/
		if (itemIndex >= 0 && itemIndex < adjacentSearchResults[searchResultIndex].items.length - 1) {
			return stripAnchor(
				trimSlashes(
					relativizeUrl(adjacentSearchResults[searchResultIndex].items[itemIndex + 1]['@id'])
				)
			);
		}
		/** otherwise get next fnurgel from first item of next search result view */
		if (
			searchResultIndex >= 0 &&
			itemIndex === adjacentSearchResults[searchResultIndex]?.items.length - 1
		) {
			return stripAnchor(
				trimSlashes(relativizeUrl(adjacentSearchResults[searchResultIndex + 1]?.items?.[0]['@id']))
			);
		}
	}
	return undefined;
}
