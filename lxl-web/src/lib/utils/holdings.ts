import { pushState } from '$app/navigation';
import isFnurgel from '$lib/utils/isFnurgel';
import type {
	BibIdObj,
	DecoratedHolder,
	FullHolderBySigel,
	HoldersByType,
	HoldingsByInstanceId,
	ItemLinksByBibId,
	ItemLinksForHolder
} from '$lib/types/holdings';
import { LensType, type FramedData, JsonLd, BibDb } from '$lib/types/xl';
import type { LocaleCode } from '$lib/i18n/locales';
import type { LibraryItem, UserSettings } from '$lib/types/userSettings';
import { relativizeUrl } from '$lib/utils/http';
import { DisplayUtil, toString } from '$lib/utils/xl.js';
import getAtPath from '$lib/utils/getAtPath';

export function getHoldingsLink(url: URL, value: string) {
	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
	newSearchParams.set('holdings', value);
	return `${url.origin}${url.pathname}?${newSearchParams.toString()}`;
}

export function handleClickHoldings(
	event: MouseEvent & { currentTarget: HTMLAnchorElement },
	state: object,
	id: string
) {
	event.preventDefault();
	pushState(event.currentTarget.href, { ...state, holdings: id });
}

export function getSelectedHolding(value: string, instanceIdsByType: { [key: string]: string[] }) {
	if (isFnurgel(value)) {
		return value;
	}
	if (instanceIdsByType[value]?.[0]) {
		return instanceIdsByType[value][0]; // get first instance if showing holdings by type
	}
	return undefined;
}

function sortHoldings(holdings) {
	return [...holdings].sort((a, b) => {
		if (a?.heldBy?.name < b?.heldBy?.name) {
			return -1;
		}
		if (a?.heldBy?.name > b?.heldBy?.name) {
			return 1;
		}
		return 0;
	});
}

export function getHoldingsByInstanceId(
	mainEntity,
	displayUtil: DisplayUtil,
	locale: LocaleCode
): HoldingsByInstanceId {
	return mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const id = relativizeUrl(instanceOfItem['@id'])?.replace('#it', '');
		if (!id) {
			return acc;
		}
		return {
			...acc,
			[id]: sortHoldings(instanceOfItem?.['@reverse']?.itemOf || []).map((holding) => {
				return {
					...holding,
					heldBy: {
						obj: displayUtil.lensAndFormat(holding.heldBy, LensType.Chip, locale),
						sigel:
							holding.heldBy?.sigel ||
							holding.heldBy['@id'].replace('https://libris.kb.se/library/', ''),
						str: toString(displayUtil.lensAndFormat(holding.heldBy, LensType.Chip, locale)) || ''
					}
				};
			})
		};
	}, {});
}

export function getBibIdsByInstanceId(
	mainEntity,
	displayUtil: DisplayUtil,
	record,
	locale: LocaleCode
): Record<string, BibIdObj> {
	return mainEntity['@reverse']?.instanceOf?.reduce((acc, instance) => {
		const id = relativizeUrl(instance['@id'])?.replace('#it', '');

		const bibId = instance.meta?.controlNumber || record?.controlNumber;
		const type = instance['@type'];
		const holders = instance['@reverse']?.itemOf?.map((i) => i?.heldBy?.sigel);
		const str =
			toString(displayUtil.lensAndFormat(instance.publication[0], LensType.Token, locale)) || '';

		// add Legacy Libris III system number for ONR param
		let onr = null;
		record?.identifiedBy?.forEach((el: { '@type': string; value: string }) => {
			if (el['@type'] === 'LibrisIIINumber') {
				onr = el.value;
			}
		});

		const isbn: string[] = [];
		const issn: string[] = [];
		instance.identifiedBy?.forEach((el: { '@type': string; value: string }) => {
			if (el['@type'] === 'ISBN') {
				isbn.push(el.value);
			}

			if (el['@type'] === 'ISSN') {
				issn.push(el.value);
			}
		});

		if (!id) {
			return acc;
		}
		return {
			...acc,
			[id]: {
				bibId,
				'@type': type,
				holders,
				onr,
				isbn,
				issn,
				str
			}
		};
	}, {});
}

export function getHoldingsByType(mainEntity: FramedData) {
	const holdingsByType = mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const type = instanceOfItem['@type'];
		return {
			...acc,
			[type]: [...(acc[type] || []), ...(instanceOfItem?.['@reverse']?.itemOf || [])]
		};
	}, {});
	if (!holdingsByType) {
		return {};
	}
	const sortedHoldingsByType = Object.entries(holdingsByType).reduce((acc, [type, holdings]) => {
		return {
			...acc,
			[type]: sortHoldings(holdings)
		};
	}, {});
	return sortedHoldingsByType;
}

export function getHoldersByType(
	holdingsByType,
	displayUtil: DisplayUtil,
	locale: LocaleCode
): HoldersByType {
	return Object.entries(holdingsByType).reduce((acc, [type, holdings]) => {
		const heldBys = holdings.map((holdingItem) => {
			return {
				obj: displayUtil.lensAndFormat(holdingItem.heldBy, LensType.Chip, locale),
				sigel: holdingItem.heldBy.sigel,
				str: toString(displayUtil.lensAndFormat(holdingItem.heldBy, LensType.Chip, locale)) || ''
			};
		});
		const uniqueHeldBys = [
			...new Map(heldBys.map((heldByItem) => [heldByItem.obj['@id'], heldByItem])).values()
		];
		return { ...acc, [type]: uniqueHeldBys };
	}, {});
}

export function getMyLibsFromHoldings(
	myLibraries: UserSettings['myLibraries'],
	holdings: HoldingsByInstanceId | HoldingsByInstanceId[string]
): LibraryItem[] {
	const result: Record<string, LibraryItem> = {};

	if (myLibraries) {
		if (Array.isArray(holdings)) {
			findLib(holdings);
		} else if (holdings && typeof holdings === 'object') {
			Object.values(holdings).forEach((holding) => findLib(holding));
		}

		function findLib(holding: HoldingsByInstanceId[string]) {
			if (myLibraries) {
				holding.forEach((holder) => {
					const found = Object.values(myLibraries).find(
						(library) => library.sigel === holder.heldBy.sigel
					);
					if (found) {
						result[found['@id']] = found;
					}
				});
			}
		}
	}
	return Object.values(result);
}

export async function getFullHolderData(allHolders: DecoratedHolder[]): Promise<FullHolderBySigel> {
	const holderBySigel: FullHolderBySigel = {};

	for (const h of allHolders) {
		const id = h.obj?.['@id'];
		const libraryRes = await fetch(`${id}?framed=true`, {
			headers: { Accept: 'application/ld+json' }
		});
		const resJson = await libraryRes.json();
		const libraryMainEntity = resJson['mainEntity'] as FramedData;

		if (libraryMainEntity) {
			holderBySigel[h.sigel] = libraryMainEntity;
		}
	}
	return holderBySigel;
}

export function getItemLinksByBibId(
	holderBySigel: FullHolderBySigel,
	bibIdsByInstanceId: Record<string, BibIdObj>,
	locale: LocaleCode,
	displayUtil: DisplayUtil
): ItemLinksByBibId {
	const linksByInstanceId: ItemLinksByBibId = {};
	for (const bibIdObj of Object.values(bibIdsByInstanceId)) {
		const linksForHolder: ItemLinksForHolder = {};
		bibIdObj.holders.forEach((sigel) => {
			const fullHolderData = holderBySigel[sigel];

			const ilsPaths = [
				[BibDb.ils, BibDb.bibIdSearchUri],
				[BibDb.ils, BibDb.isbnSearchUri],
				[BibDb.ils, BibDb.issnSearchUri]
			];

			const lopacPaths = [[BibDb.lopac, BibDb.bibIdSearchUriByLang]];

			let linksToItem = getLinksToItemFor(bibIdObj, fullHolderData, ilsPaths, locale);
			const lopacLinksItem = getLinksToItemFor(bibIdObj, fullHolderData, lopacPaths, locale);

			const linkTemplateEod = getAtPath(fullHolderData, [BibDb.eodUri], []);
			if (linkTemplateEod) {
				linksToItem = [linkTemplateEod.replace(/%BIB_*ID%/, bibIdObj.bibId), ...linksToItem];
			}

			//TODO: rename
			const allLinks: { [linkType: string]: string[] } = {};

			const itemStatusUri = getAtPath(fullHolderData, [BibDb.ils, BibDb.itemStatusUri], []);

			if (itemStatusUri && itemStatusUri.length !== 0) {
				allLinks[BibDb.ItemStatus] = [itemStatusUri];
			}

			const linksToCatalog: string[] = [];
			const linkToCatalog = getAtPath(fullHolderData, [BibDb.ils, 'url'], undefined);
			if (linkToCatalog && linkToCatalog.length !== 0) {
				linksToCatalog.push(linkToCatalog);
				//TODO: formalize keys
				allLinks[BibDb.LinksToCatalog] = linksToCatalog;
			}

			const linksToSite: string[] = [];
			const linkToSite = getAtPath(fullHolderData, ['url', JsonLd.ID], undefined);
			if (linkToSite && linkToSite.length !== 0) {
				linksToSite.push(linkToSite);
				allLinks[BibDb.LinksToSite] = linksToSite;
			}

			const openingHoursList: string[] = [];
			const openingHours = getAtPath(fullHolderData, [BibDb.openingHours], undefined);
			if (openingHours && openingHours !== '') {
				openingHoursList.push(openingHours);
				allLinks[BibDb.OpeningHours] = openingHoursList;
			}

			const addresses: string[] = [];
			const address = getAtPath(fullHolderData, [BibDb.address, '*'], undefined);
			const postalAddress = address.find((a) => a[JsonLd.TYPE] === BibDb.postalAddress);
			const visitingAddress = address.find((a) => a[JsonLd.TYPE] === BibDb.visitingAddress);

			if (address && address.length !== 0) {
				addresses.push(
					toString(displayUtil.lensAndFormat(visitingAddress, LensType.Card, locale)) || ''
				);
				addresses.push(
					toString(displayUtil.lensAndFormat(postalAddress, LensType.Card, locale)) || ''
				);
				allLinks[BibDb.Address] = addresses;
			}

			if (linksToItem.length !== 0) {
				allLinks[BibDb.LinksToItem] = linksToItem;
			}

			if (lopacLinksItem.length !== 0) {
				allLinks[BibDb.LoanReserveLink] = lopacLinksItem;
			}

			if (Object.keys(allLinks).length !== 0) {
				linksForHolder[sigel] = allLinks;
			}
		});
		linksByInstanceId[bibIdObj.bibId] = linksForHolder;
	}
	return linksByInstanceId;
}

function getLinksToItemFor(
	bibIdObj: BibIdObj,
	fullHolderData: FramedData,
	paths: string[][],
	locale: LocaleCode
): string[] {
	let linksToItem: string[] = [];
	for (const path of paths) {
		const linkTemplate = getAtPath(fullHolderData, path, []);
		if (linkTemplate && linkTemplate.length !== 0) {
			if (path.includes(BibDb.bibIdSearchUriByLang) && bibIdObj.bibId !== '') {
				linksToItem = [linkTemplate[locale].replace(/%BIB_*ID%/, bibIdObj.bibId), ...linksToItem];
			}
			if (path.includes(BibDb.bibIdSearchUri) && bibIdObj.bibId !== '') {
				// forms in the wild %BIB_ID%, %BIBID%, more???
				linksToItem = [linkTemplate.replace(/%BIB_*ID%/, bibIdObj.bibId), ...linksToItem];
			}
			if (path.includes(BibDb.isbnSearchUri) && bibIdObj.isbn.length !== 0) {
				linksToItem = [linkTemplate.replace(/%ISBN%/, bibIdObj.isbn), ...linksToItem];
			}
			if (path.includes(BibDb.issnSearchUri) && bibIdObj.issn.length !== 0) {
				linksToItem = [linkTemplate.replace(/%ISSN%/, bibIdObj.issn), ...linksToItem];
			}
		}
	}
	return linksToItem;
}
