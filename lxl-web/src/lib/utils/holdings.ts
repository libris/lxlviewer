import { pushState } from '$app/navigation';
import isFnurgel from '$lib/utils/isFnurgel';
import type {
	BibIdObj,
	DecoratedHolder,
	FullHolderBySigel,
	HoldersByType,
	HoldingsByInstanceId,
	ItemLinksByInstanceId,
	ItemLinksForHolder
} from '$lib/types/holdings';
import { LensType, type FramedData } from '$lib/types/xl';
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

export function getBibIdsByInstanceId(mainEntity, record): Record<string, BibIdObj> {
	return mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const id = relativizeUrl(instanceOfItem['@id'])?.replace('#it', '');

		const bibId = instanceOfItem.meta?.controlNumber || record?.controlNumber;
		const type = instanceOfItem['@type'];
		const holders = instanceOfItem['@reverse']?.itemOf?.map((i) => i?.heldBy?.sigel);

		// add Legacy Libris III system number for ONR param
		let onr = null;
		record?.identifiedBy?.forEach((el: { '@type': string; value: string }) => {
			if (el['@type'] === 'LibrisIIINumber') {
				onr = el.value;
			}
		});

		const isbn: string[] = [];
		const issn: string[] = [];
		instanceOfItem.identifiedBy?.forEach((el: { '@type': string; value: string }) => {
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
				issn
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

export function getItemLinksByInstanceId(
	holderBySigel: FullHolderBySigel,
	bibIdsByInstanceId: Record<string, BibIdObj>
): ItemLinksByInstanceId {
	const ilsProperties = ['bibdb:bibIdSearchUri', 'bibdb:isbnSearchUri', 'bibdb:issnSearchUri'];

	const linksByInstanceId: ItemLinksByInstanceId = {};
	for (const [id, bibIdObj] of Object.entries(bibIdsByInstanceId)) {
		const linksForHolder: ItemLinksForHolder = {};
		bibIdObj.holders.forEach((sigel) => {
			const fullHolderData = holderBySigel[sigel];

			let linksToItem: string[] = [];
			for (const key of ilsProperties) {
				const linkTemplateIls = getAtPath(fullHolderData, ['bibdb:ils', key], []);
				if (linkTemplateIls.length !== 0) {
					if (key === 'bibdb:bibIdSearchUri' && bibIdObj.bibId !== '') {
						// forms in the wild %BIB_ID%, %BIBID%, more???
						linksToItem = [linkTemplateIls.replace(/%BIB_*ID%/, bibIdObj.bibId), ...linksToItem];
					}
					if (key === 'bibdb:isbnSearchUri' && bibIdObj.isbn.length !== 0) {
						linksToItem = [linkTemplateIls.replace(/%ISBN%/, bibIdObj.isbn), ...linksToItem];
					}
					if (key === 'bibdb:issnSearchUri' && bibIdObj.issn.length !== 0) {
						linksToItem = [linkTemplateIls.replace(/%ISSN%/, bibIdObj.issn), ...linksToItem];
					}
				}
			}
			const linkTemplateEod = getAtPath(fullHolderData, ['bibdb:eodUri'], []);
			if (linkTemplateEod) {
				linksToItem = [linkTemplateEod.replace(/%BIB_*ID%/, bibIdObj.bibId), ...linksToItem];
			}

			const allLinks: { [linkType: string]: string[] } = {};

			const linksToSite: string[] = [];
			const linkToSite = getAtPath(fullHolderData, ['bibdb:ils', 'url'], undefined);
			if (linkToSite && linkToSite.length !== 0) {
				linksToSite.push(linkToSite);
				//TODO: formalize keys
				allLinks['linksToSite'] = linksToSite;
			}

			if (linksToItem.length !== 0) {
				linksForHolder[sigel] = { linksToItem: linksToItem };
				allLinks['linksToItem'] = linksToItem;
			}

			if (Object.keys(allLinks).length !== 0) {
				linksForHolder[sigel] = allLinks;
			}
		});
		linksByInstanceId[id] = linksForHolder;
	}
	return linksByInstanceId;
}
