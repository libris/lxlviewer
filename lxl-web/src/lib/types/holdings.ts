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

export type ItemLinksBySigel = {
	[sigel: string]: HolderLinks;
};

export type HolderLinks = {
	[BibDb.LinksToCatalog]: string[];
	[BibDb.LinksToSite]: string[];
	[BibDb.OpeningHours]: string[];
	[BibDb.Address]: string[];
	[BibDb.MyLoansLink]: string;
	[BibDb.RegistrationLink]: string;
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
	itemLinksBySigel: ItemLinksBySigel;
	holdersByType?: HoldersByType;
	overview: unknown;
	instances: Record<string, unknown>[];
	title: string;
};
