import { pushState } from '$app/navigation';
import type {
	BibIdObj,
	HoldingLinks,
	HoldersByInstanceId,
	LibraryWithLinks
} from '$lib/types/holdings';
import { BibDb } from '$lib/types/xl';
import type { LocaleCode } from '$lib/i18n/locales';
import type { LibraryItem, UserSettings } from '$lib/types/userSettings';
import { stripAnchor } from '$lib/utils/http';
import getAtPath from '$lib/utils/getAtPath';
import { USE_HOLDING_PANE } from '$lib/constants/panels';

export function getHoldingsLink(url: URL, value: string) {
	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
	newSearchParams.set('holdings', value);
	const conditionallyAddAnchor = url.searchParams.has('holdings') ? '' : `#${value}`;
	return `${url.origin}${url.pathname}?${newSearchParams.toString()}${USE_HOLDING_PANE ? conditionallyAddAnchor : ''}`;
}

export function handleClickHoldings(
	event: MouseEvent & { currentTarget: HTMLAnchorElement },
	state: object,
	id: string
) {
	event.preventDefault();
	pushState(event.currentTarget.href, { ...state, holdings: stripAnchor(id) });
}

// todo working
export function getMyLibsFromHoldings(
	myLibraries: UserSettings['myLibraries'],
	holdings: HoldersByInstanceId | HoldersByInstanceId[string]
): LibraryItem[] {
	const result: Record<string, LibraryItem> = {};

	if (myLibraries) {
		// const result = Array.isArray(holdings) ? holdings.filter

		if (Array.isArray(holdings)) {
			findLib(holdings);
		} else if (holdings && typeof holdings === 'object') {
			Object.values(holdings).forEach((holding) => findLib(holding));
		}

		function findLib(holding: HoldersByInstanceId[string]) {
			if (myLibraries) {
				holding.forEach((holder) => {
					// console.log('HOLDER', holder)
					const found = Object.values(myLibraries).find((library) => library.sigel === holder);
					if (found) {
						result[found['@id']] = found;
					}
				});
			}
		}
	}
	return Object.values(result);
}

/**
 * Create holder-instance-specific links
 */
export function createHoldingLinks(
	bibIdObj: BibIdObj,
	fullHolderData: LibraryWithLinks,
	locale: LocaleCode
): HoldingLinks {
	const ilsPaths = [
		[BibDb.ils, BibDb.bibIdSearchUri],
		[BibDb.ils, BibDb.isbnSearchUri],
		[BibDb.ils, BibDb.issnSearchUri]
	];
	const lopacPathsLoanReserve = [[BibDb.lopac, BibDb.bibIdSearchUriByLang]];

	let linksToItem = getLinksToItemFor(bibIdObj, fullHolderData, ilsPaths, locale);
	const lopacLinksLoanReserve = getLinksToItemFor(
		bibIdObj,
		fullHolderData,
		lopacPathsLoanReserve,
		locale
	);

	const linkTemplateEod = getAtPath(fullHolderData, [BibDb.eodUri], []);
	if (linkTemplateEod && linkTemplateEod.length) {
		linksToItem = [linkTemplateEod.replace(/%BIB_*ID%/, bibIdObj.bibId), ...linksToItem];
	}

	const itemStatusUri = getAtPath(fullHolderData, [BibDb.ils, BibDb.itemStatusUri], []);

	return {
		linksToItem: linksToItem || [],
		itemStatus: itemStatusUri || null,
		loanReserveLink: lopacLinksLoanReserve || [],
		str: bibIdObj.str
	};
}

function getLinksToItemFor(
	bibIdObj: BibIdObj,
	fullHolderData: LibraryWithLinks,
	paths: string[][],
	locale: LocaleCode
): string[] {
	let linksToItem: string[] = [];
	for (const path of paths) {
		const linkTemplate = getAtPath(fullHolderData, path, []);
		if (linkTemplate && Object.keys(linkTemplate).length) {
			if (path.includes(BibDb.bibIdSearchUriByLang) && bibIdObj.bibId !== '') {
				const linkTemplateLocalized =
					linkTemplate[locale] || linkTemplate['sv'] || Object.values(linkTemplate)[0];
				linksToItem = [linkTemplateLocalized.replace(/%BIB_*ID%/g, bibIdObj.bibId), ...linksToItem];
			}
			if (path.includes(BibDb.bibIdSearchUri) && bibIdObj.bibId !== '') {
				// forms in the wild %BIB_ID%, %BIBID%, more???
				linksToItem = [linkTemplate.replace(/%BIB_*ID%/g, bibIdObj.bibId), ...linksToItem];
			}
			if (path.includes(BibDb.isbnSearchUri) && bibIdObj.isbn.length) {
				linksToItem = [linkTemplate.replace(/%ISBN%/g, bibIdObj.isbn), ...linksToItem];
			}
			if (path.includes(BibDb.issnSearchUri) && bibIdObj.issn.length) {
				linksToItem = [linkTemplate.replace(/%ISSN%/g, bibIdObj.issn), ...linksToItem];
			}
		}
	}
	return linksToItem;
}
