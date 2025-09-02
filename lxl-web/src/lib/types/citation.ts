import type { availableFormats } from '$lib/utils/citation';

// full CSL-JSON schema, see
// https://github.com/citation-style-language/schema/blob/master/schemas/input/csl-data.json
interface CSLDate {
	'date-parts': number[][];
	literal?: string;
	raw?: string;
}

interface CSLName {
	family: string;
	given?: string;
	literal?: string;
	suffix?: string;
	commaSuffix?: boolean;
	droppingParticle?: string;
	nonDroppingParticle?: string;
	staticOrdering?: boolean;
	multi?: {
		family: { en: string; [key: string]: string };
		given?: { en: string; [key: string]: string };
	};
}

type CSLItemType = 'article' | 'book'; // TODO

export interface CSLJSON {
	author?: CSLName[];
	id: string | number;
	ISBN?: string;
	issued?: CSLDate;
	publisher?: string;
	'publisher-place'?: string;
	title?: string;
	type: CSLItemType;
}

export type AvailableCitationFormat = keyof typeof availableFormats;
