import { defaultLocale, type LocaleCode } from '#lib/i18n/locales.js';
import type { ApiError } from '#lib/types/api.js';
import type { AvailableCitationFormat, CSLJSON } from '#lib/types/citation.js';
import { initCite } from '#lib/utils/citation.js';
import { relativizeUrl, stripAnchor, trimSlashes } from '#lib/utils/http.js';
import { getContext, setContext } from 'svelte';

type Selection = {
	id: string;
	csl: CSLJSON;
};

type SelectionContext = {
	readonly loading: boolean;
	readonly length: number;
	readonly citation: ReturnType<Awaited<ReturnType<typeof initCite>>['formatAs']> | undefined;
	format: AvailableCitationFormat | undefined;
	isSelected(id: string): boolean;
	toggle(id: string): Promise<void>;
	clear(): void;
	init(locale: LocaleCode, defaultFormat: AvailableCitationFormat): Promise<void>;
};

function createSelection(): SelectionContext {
	let locale: LocaleCode = $state(defaultLocale);
	let selection = $state<Selection[]>([]);
	let loading = $state(false);
	let cite: Awaited<ReturnType<typeof initCite>> | undefined;
	let currentFormat = $state<AvailableCitationFormat | undefined>();
	let citation = $state<ReturnType<Awaited<ReturnType<typeof initCite>>['formatAs']>>();

	function updateCitation() {
		cite?.set(selection.map((item) => item.csl));
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
			const normalizedId = normalize(id);

			if (!normalizedId) return;

			if (selection.some((item) => item.id === normalizedId)) {
				selection = selection.filter((item) => item.id !== normalizedId);
				updateCitation();
				return;
			}

			loading = true;

			try {
				const res = await fetch(
					`/api/${locale}/cite?id=${encodeURIComponent(normalizedId)}&format=csl`
				);

				if (!res.ok) {
					const error = (await res.json()) as ApiError;
					console.error(error);
					return;
				}

				const csl: CSLJSON[] = await res.json();

				if (Array.isArray(csl) && csl.length === 1) {
					selection.push({
						id: normalizedId,
						csl: csl[0]
					});

					updateCitation();
				}
			} catch (error) {
				console.error('Failed to fetch citation:', error);
			} finally {
				loading = false;
			}
		},

		clear() {
			selection = [];
			cite?.reset();
			citation = currentFormat ? cite?.formatAs(currentFormat) : undefined;
		}
	};
}

function normalize(id: string) {
	return stripAnchor(trimSlashes(relativizeUrl(id))) || '';
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
