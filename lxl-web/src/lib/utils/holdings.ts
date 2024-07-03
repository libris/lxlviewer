import { pushState } from '$app/navigation';
import isFnurgel from '$lib/utils/isFnurgel';
import { relativizeUrl } from '$lib/utils/http';
import { type FramedData } from '$lib/types/xl';

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

export function getHoldingsByInstanceId(mainEntity) {
	return mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const id = relativizeUrl(instanceOfItem['@id'])?.replace('#it', '');
		if (!id) {
			return acc;
		}
		return {
			...acc,
			[id]: sortHoldings(instanceOfItem?.['@reverse']?.itemOf || [])
		};
	}, {});
}

export function getBibIdsByInstanceId(mainEntity) {
	return mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const id = relativizeUrl(instanceOfItem['@id'])?.replace('#it', '');

		// TODO better (is there an existing lxljs util for getting bib-ids?)
		const bibId =
			relativizeUrl(instanceOfItem.sameAs?.[0]?.['@id'])?.replace('resourcebib', '') || id;
		const type = instanceOfItem['@type'];
		const holders = instanceOfItem['@reverse']?.itemOf?.map((i) => i?.heldBy?.sigel);
		if (!id) {
			return acc;
		}
		return {
			...acc,
			[id]: {
				bibId,
				'@type': type,
				holders
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
