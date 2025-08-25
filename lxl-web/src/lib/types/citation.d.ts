// reworked from https://github.com/citation-js/citation-js/issues/104#issuecomment-2333614835

declare module '@citation-js/core' {
	interface InputOptions {
		output: OutputOptions;
		forceType?: InputFormat;
	}

	interface OutputOptions {
		format?: 'real' | 'string';
		type?: 'json' | 'html' | 'string';
		style?: 'csl' | 'bibtex' | 'ris' | 'cication-*';
		lang?: 'en-US';
		prepend?: string | (() => void);
		append?: string | (() => void);
	}

	type InputFormat = 'csl' | 'ris' | 'bibtex';

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

	type CSLItemType =
		| 'article'
		| 'article-journal'
		| 'article-magazine'
		| 'article-newspaper'
		| 'book'
		| 'chapter'
		| 'entry'
		| 'entry-dictionary'
		| 'entry-encyclopedia'
		| 'manuscript'
		| 'paper-conference'
		| 'patent'
		| 'report'
		| 'thesis'
		| 'webpage'
		| 'bill'
		| 'case'
		| 'graphic'
		| 'interview'
		| 'legislation'
		| 'motion_picture'
		| 'song'
		| 'speech'
		| 'map'
		| 'broadcast'
		| 'personal_communication'
		| 'software'
		| 'dataset'
		| 'figure'
		| 'post'
		| 'document'
		| 'other';

	export interface CSLJSON {
		abstract?: string;
		accessed?: CSLDate;
		archive?: string;
		archiveLocation?: string;
		author?: CSLName[];
		chapterNumber?: string;
		citationLabel?: string;
		citationNumber?: number;
		collectionEditor?: CSLName[];
		collectionTitle?: string;
		containerTitle?: string;
		DOI?: string;
		edition?: string;
		editor?: CSLName[];
		event?: string;
		eventPlace?: string;
		genre?: string;
		id: string | number;
		ISBN?: string;
		ISSN?: string;
		issue?: string;
		issued?: CSLDate;
		jurisdiction?: string;
		keyword?: string;
		language?: string;
		medium?: string;
		note?: string;
		number?: string;
		numberOfVolumes?: string;
		originalDate?: CSLDate;
		originalPublisher?: string;
		originalPublisherPlace?: string;
		originalTitle?: string;
		page?: string;
		publisher?: string;
		publisherPlace?: string;
		references?: string;
		reviewedAuthor?: CSLName[];
		reviewedTitle?: string;
		section?: string;
		shortTitle?: string;
		source?: string;
		status?: string;
		submitted?: CSLDate;
		title?: string;
		translator?: CSLName[];
		type: CSLItemType;
		URL?: string;
		version?: string;
		volume?: string;
	}

	export class Cite {
		constructor(data: CSLJSON | CSLJSON[], options?: InputOptions);
		get(options?: OutputOptions): string | Array<object>;
		// todo format etc...
	}
}
