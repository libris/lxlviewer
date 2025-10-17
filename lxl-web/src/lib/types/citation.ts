import type { availableFormats } from '$lib/utils/citation';
import type { ApiError } from './api';

// full CSL-JSON schema, see
// https://github.com/citation-style-language/schema/blob/master/schemas/input/csl-data.json
interface CSLDate {
	'date-parts': number[][];
	literal?: string;
	raw?: string;
}

export interface CSLName {
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

export type CSLType = 'book' | 'article' | 'periodical';

export interface CSLJSON {
	type: CSLType;
	id: string;
	language?: string;
	shortTitle?: string;
	author?: CSLName[];
	composer?: CSLName[];
	director?: CSLName[];
	editor?: CSLName[];
	interviewer?: CSLName[];
	illustrator?: CSLName[];
	translator?: CSLName[];
	issued?: CSLDate;
	abstract?: string;
	'container-title'?: string;
	DOI?: string;
	edition?: string | number;
	ISBN?: string;
	ISSN?: string;
	issue?: string | number;
	keyword?: string;
	'number-of-pages'?: string | number;
	publisher?: string;
	'publisher-place'?: string;
	title?: string;
	URL?: string;
	volume?: string | number;
}

export interface CitationsType {
	data:
		| {
				citation: string;
				fileFormat?: string;
				fullName?: string;
				key: AvailableCitationFormat;
				name: string;
		  }[]
		| undefined;
	error: ApiError | undefined;
}

export type AvailableCitationFormat = keyof typeof availableFormats;
