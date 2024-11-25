import { pushState } from '$app/navigation';
import isFnurgel from '$lib/utils/isFnurgel';
import { relativizeUrl } from '$lib/utils/http';
import { LensType, type FramedData } from '$lib/types/xl';
import type { BibIdObj, HoldersByType, HoldingsByInstanceId } from '$lib/types/holdings';
import { DisplayUtil, toString } from '$lib/utils/xl.js';
import type { LocaleCode } from '$lib/i18n/locales';

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
						sigel: holding.heldBy?.sigel,
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
