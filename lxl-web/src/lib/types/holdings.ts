import type { BibDb, FramedData, JsonLd } from './xl';

export type HoldingMainEntity = {
	[JsonLd.REVERSE]?: {
		instanceOf: HoldingInstance[];
	};
};

export type HoldingInstance = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: string;
	[JsonLd.REVERSE]?: {
		itemOf: HoldingItem[];
	};
	meta?: {
		controlNumber?: string;
	};
	publication?: FramedData[];
	identifiedBy?: {
		[JsonLd.TYPE]: string;
		value: string;
	}[];
};

type HoldingItem = {
	[JsonLd.ID]: string;
	[JsonLd.TYPE]: 'Item';
	heldBy: LibraryChip;
	itemOf: { [JsonLd.ID]: string };
	sameAs?: unknown;
	shelfMark?: unknown;
	availability?: unknown;
	hasComponent?: unknown;
	shelfControlNumber?: string;
	physicalLocation?: unknown;
	meta: Record<string, unknown>;
};

type RecordId = string;
export type LibraryId = string;
export type OrgId = string;

export type LibraryRecord = {
	[JsonLd.ID]: RecordId;
	[JsonLd.TYPE]: 'Record';
	mainEntity: {
		[JsonLd.ID]: string;
	};
};

type LibraryChip = {
	[JsonLd.ID]: LibraryId;
	[JsonLd.TYPE]: 'Library';
	name: string;
	sigel: string;
	meta: LibraryRecord;
};

export interface LibraryFull extends LibraryChip {
	isPartOf: { [JsonLd.ID]: OrgId };
	[BibDb.ils]: Record<string, string>;
	[BibDb.lopac]: Record<string, string>;
	[BibDb.address]?: Record<string, string>[];
}

export interface LibraryWithLinks extends LibraryFull {
	_links: HolderLinks;
}

export type BibIdObj = {
	bibId: string;
	[JsonLd.TYPE]: string;
	onr: string | null;
	isbn: string[];
	issn: string[];
	str: string;
};

export type BibIdData = { [instanceId: string]: BibIdObj };

export type HoldersByInstanceId = {
	[id: LibraryId]: string[];
};

export type HoldingsByType = {
	[type: string]: HoldingItem[];
};

export type HoldersByType = {
	[type: string]: string[];
};

export type HolderLinks = {
	[BibDb.LinksToCatalog]: string[];
	[BibDb.LinksToSite]: string[];
	[BibDb.OpeningHours]: string[];
	[BibDb.Address]: string[];
	[BibDb.MyLoansLink]: string;
	[BibDb.RegistrationLink]: string;
};

export type HoldingLinks = {
	[BibDb.LinksToItem]: string[];
	[BibDb.ItemStatus]: string | null;
	[BibDb.LoanReserveLink]: string[];
	str: string;
};

export type HoldingsData = {
	bibIdData: BibIdData;
	byInstanceId: HoldersByInstanceId;
	byType: HoldersByType;
	holdingLibraries: Record<LibraryId, LibraryWithLinks | null>;
};
