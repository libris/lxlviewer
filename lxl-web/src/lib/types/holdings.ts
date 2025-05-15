import type { DisplayDecorated, FramedData } from './xl';

export type BibIdObj = {
	bibId: string;
	'@type': string;
	holders: string[];
	onr: string | null;
	isbn: string[];
	issn: string[];
	str: string;
};

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

export type ItemLinksForHolder = {
	[sigel: string]: { [linkType: string]: string[] }; //links
};

export type ItemLinksByBibId = {
	[id: string]: ItemLinksForHolder;
};
