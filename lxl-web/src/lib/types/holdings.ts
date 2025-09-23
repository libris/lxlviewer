import type { BibDb, DisplayDecorated, FramedData } from './xl';

export type BibIdObj = {
	bibId: string;
	'@type': string;
	holders: string[];
	onr: string | null;
	isbn: string[];
	issn: string[];
	str: string;
};

export type BibIdByInstanceId = { [instanceId: string]: BibIdObj };

export type HoldingsByInstanceId = {
	[id: string]: {
		'@id': string;
		'@type': string;
		heldBy: DecoratedHolder;
		itemOf: {
			'@id': string;
		};
	}[];
};

export type HoldersByType = {
	[type: string]: DecoratedHolder[];
};

export type DecoratedHolder = {
	obj: DisplayDecorated;
	sigel: string;
	str: string;
};

export type FullHolderBySigel = {
	[sigel: string]: FramedData;
};

// todo remove
// export type ItemLinksForHolder = {
// 	[sigel: string]: { [linkType: string]: string[] };
// };

// // todo remove
// export type ItemLinksByBibId = {
// 	[id: string]: ItemLinksForHolder;
// };

export type ItemLinksBySigel = {
	[sigel: string]: HolderLinks;
};

export type HolderLinks = {
	[BibDb.Address]: string[];
	[BibDb.LinksToSite]: string[];
	[BibDb.LinksToCatalog]: string[];
	[BibDb.OpeningHours]: string[];
	bibIds: {
		[bibId: string]: HoldingLinks;
	};
};

type HoldingLinks = {
	[BibDb.LinksToItem]: string[];
	[BibDb.ItemStatus]: string | null;
	[BibDb.LoanReserveLink]: string[];
	str: string;
};

export type HoldingsData = {
	bibIdsByInstanceId: BibIdByInstanceId;
	holdingsByInstanceId: HoldingsByInstanceId;
	// itemLinksByBibId: ItemLinksByBibId; // todo remove
	itemLinksBySigel: ItemLinksBySigel;
	holdersByType?: HoldersByType;
	overview: unknown;
	instances: Record<string, unknown>[];
	title: string;
};
