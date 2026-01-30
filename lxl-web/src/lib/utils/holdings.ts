import { pushState } from '$app/navigation';
import type {
	BibIdObj,
	HoldersByType,
	HoldingLinks,
	LibraryFull,
	LibraryId,
	LibraryWithLinks,
	LinkResolver,
	OrgId
} from '$lib/types/holdings';
import { BibDb } from '$lib/types/xl';
import type { MyLibrariesType } from '$lib/types/userSettings';
import type { LocaleCode } from '$lib/i18n/locales';
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

	let linkResolver;
	if (fullHolderData?.[BibDb.linkResolver]) {
		linkResolver = buildLinkServerLink(fullHolderData?.[BibDb.linkResolver], bibIdObj);
	}

	return {
		linksToItem: linksToItem || [],
		itemStatus: itemStatusUri || null,
		loanReserveLink: lopacLinksLoanReserve || [],
		linkResolver
	};
}

// https://en.wikipedia.org/wiki/OpenURL
// https://help.oclc.org/Resource_Sharing/Relais_ILL/Relais_Portal/OpenURL/OpenURL
function buildLinkServerLink(linkResolver: LinkResolver, obj: BibIdObj) {
	const linkResolverParams = {
		url_ver: 'Z39.88-2004',
		rfr_id: 'info:sid/libris.kb.se:libris',
		'rft.id': `info:SE-LIBR/${obj.bibId}`,
		'rft.isbn': obj?.isbn,
		'rft.issn': obj?.issn,
		'rft.title': obj?.titleStr
	};
	try {
		const url = new URL(linkResolver.uri);
		Object.entries(linkResolverParams).forEach(([key, val]) => {
			if (val) {
				if (Array.isArray(val)) {
					val.forEach((v) => {
						url.searchParams.set(key, v);
					});
				} else {
					url.searchParams.set(key, val);
				}
			}
		});
		return {
			uri: url.toString(),
			label: linkResolver.label
		};
	} catch {
		return undefined;
	}
}

function getLinksToItemFor(
	bibIdObj: BibIdObj,
	fullHolderData: LibraryFull,
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

export function isLibraryOrg(id: LibraryId): boolean {
	if (id && typeof id === 'string' && id.startsWith('https://libris.kb.se/library/org/')) {
		return true;
	}
	return false;
}

/**
 * Get myLibraries id:s that are holders of a resource -
 * orgs will be included if passed (with its members) as argument
 */
export function getMyLibsFromHoldings(
	myLibraries: MyLibrariesType | undefined,
	holdings: string[] | HoldersByType | HoldersByType[string],
	orgs?: Record<string, string[]>
): (LibraryId | OrgId)[] | null {
	if (!myLibraries) return null;

	const holdingIds = Array.isArray(holdings) ? holdings : Object.values(holdings).flat();

	const holdingSet = new Set(holdingIds);

	const result = new Set<LibraryId | OrgId>();

	for (const libId of Object.keys(myLibraries)) {
		if (isLibraryOrg(libId)) {
			if (orgs) {
				const orgMembers = orgs[libId];

				if (orgMembers && Array.isArray(orgMembers)) {
					for (const memberId of orgMembers) {
						// add the org to result - not the member sigel
						if (holdingSet.has(memberId)) {
							result.add(libId);
						}
					}
					continue;
				}
			}
		}

		if (holdingSet.has(libId)) {
			result.add(libId);
		}
	}

	return result.size ? [...result] : null;
}
