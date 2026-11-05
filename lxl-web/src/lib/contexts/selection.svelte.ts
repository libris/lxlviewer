import { SELECTION_LIMIT } from '#lib/constants/selection.js';
import { defaultLocale, type LocaleCode } from '#lib/i18n/locales.js';
import { getSelectionData } from '#lib/remotes/selection.remote.js';
import type { AvailableCitationFormat, CSLJSON } from '#lib/types/citation.js';
import type { SearchResultItem } from '#lib/types/search.js';
import { JsonLd } from '#lib/types/xl.js';
import { initCite } from '#lib/utils/citation.js';
import { relativizeUrl, stripAnchor, trimSlashes } from '#lib/utils/http.js';
import { getContext, setContext } from 'svelte';

type Selection = {
	id: string;
	requestId: symbol;
	csl?: CSLJSON;
};

export type ReviewItem = {
	id: string;
	str: string;
	instances: { id: string; str: string }[];
};

type SelectionContext = {
	readonly loading: boolean;
	readonly length: number;
	readonly citation: Awaited<string> | undefined;
	readonly forReview: ReviewItem[];
	readonly cards: SearchResultItem[];
	readonly limit: number;
	readonly limitReached: boolean;
	format: AvailableCitationFormat | undefined;
	isSelected(id: string): boolean;
	toggle(id: string): Promise<void>;
	add(id: string): Promise<void>;
	remove(id: string): void;
	clear(): void;
	init(locale: LocaleCode, defaultFormat: AvailableCitationFormat): Promise<void>;
};

function createSelection(): SelectionContext {
	let cite: Awaited<ReturnType<typeof initCite>> | undefined;
	let locale: LocaleCode = $state(defaultLocale);
	let selection = $state<Selection[]>([]);
	let cards: SearchResultItem[] = $state([]);
	let forReview: ReviewItem[] = $state([]);
	let currentFormat = $state<AvailableCitationFormat | undefined>();
	let citation = $state<ReturnType<Awaited<ReturnType<typeof initCite>>['formatAs']>>();
	const limit = SELECTION_LIMIT;
	let loading = $state(false);
	let pendingRequests = 0;

	function updateCitation() {
		cite?.set(selection.flatMap((item) => (item.csl ? [item.csl] : [])));
		citation = currentFormat ? cite?.formatAs(currentFormat) : undefined;
	}

	return {
		get loading() {
			return loading;
		},

		get length() {
			return selection.length;
		},

		get citation() {
			return citation;
		},

		get format() {
			return currentFormat;
		},

		get cards() {
			return cards;
		},

		get forReview() {
			return forReview;
		},

		get limit() {
			return limit;
		},

		get limitReached() {
			return selection.length >= limit;
		},

		set format(format: AvailableCitationFormat | undefined) {
			currentFormat = format;
			citation = currentFormat ? cite?.formatAs(currentFormat) : undefined;
		},

		async init(_locale: LocaleCode, defaultFormat: AvailableCitationFormat) {
			currentFormat = defaultFormat;
			locale = _locale;
			cite = await initCite(_locale);
			updateCitation();
		},

		isSelected(id: string) {
			const normalizedId = normalize(id);
			return selection.some((item) => item.id === normalizedId);
		},

		async toggle(id: string) {
			const existing = this.isSelected(id);

			if (existing) {
				this.remove(id);
			} else {
				this.add(id);
			}
		},

		async add(id: string) {
			if (this.limitReached) return;

			const normalizedId = normalize(id);
			if (!normalizedId) return;

			if (this.isSelected(normalizedId)) {
				return;
			}

			// add immediately so selection gets length -> open panel
			const item: Selection = {
				id: normalizedId,
				requestId: Symbol(normalizedId)
			};
			selection.push(item);

			pendingRequests++;
			loading = true;

			try {
				const { csl, card, work } = await getSelectionData({ id: normalizedId, locale });
				const entry = selection.find((entry) => entry.id === normalizedId);

				if (entry?.requestId === item.requestId) {
					if (csl.length === 1) {
						entry.csl = csl[0];
					}

					if (work) {
						forReview.push(work);
					}

					if (card) {
						cards.push(card);
					}
				} else {
					// user may have deselect the entry while fetching
					selection = selection.filter((entry) => entry.requestId !== item.requestId);
				}
			} catch (error) {
				console.error('Failed to fetch citation:', error);
				selection = selection.filter((entry) => entry !== item);
			} finally {
				pendingRequests--;
				loading = pendingRequests > 0;
				updateCitation();
			}
		},

		remove(id: string) {
			const normalizedId = normalize(id);
			if (!normalizedId) return;

			selection = selection.filter((item) => item.id !== normalizedId);
			forReview = forReview.filter((item) => normalize(item.id) !== normalizedId);
			cards = cards.filter((item) => normalize(item[JsonLd.ID]) !== normalizedId);
			updateCitation();
		},

		clear() {
			selection = [];
			forReview = [];
			cards = [];

			cite?.reset();
			citation = currentFormat ? cite?.formatAs(currentFormat) : undefined;
		}
	};
}

function normalize(id: string) {
	return stripAnchor(trimSlashes(relativizeUrl(id))) || id;
}

const selectionKey = Symbol('selection');

export function setSelectionContext() {
	const selection = createSelection();
	setContext(selectionKey, selection);
	return selection;
}

export function getSelectionContext() {
	return getContext<SelectionContext>(selectionKey);
}
