export interface FindResponse {
	'@type': string;
	'@id': string;
	itemOffset: number;
	itemsPerPage: number;
	totalItems: number;
	search: {
		mapping: { variable: string; predicate: any; value: string; object: any; up: any }[];
	};
	first: {
		'@id': string;
	};
	last: {
		'@id': string;
	};
	next: {
		'@id': string;
	};
	items: {
		'@id': string;
		'@type': string;
		'@reverse': any;
		hasTitle?: {
			'@type': string;
			mainTitle: string;
		}[];
		language?: {
			'@id': string;
			'@type': string;
			code: string;
		}[];
		instanceTypes: any;
	}[];
	stats: {
		'@id': string;
		sliceByDimension: any;
	};
	offset?: number;
}
