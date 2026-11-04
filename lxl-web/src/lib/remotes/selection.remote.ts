import * as v from 'valibot';
import { getRequestEvent, query } from '$app/server';
import { API_URL, AUXD_SECRET } from '$app/env/private';
import { getSupportedLocale } from '#lib/i18n/locales.js';
import { error } from '@sveltejs/kit';
import type { SearchResultItem } from '#lib/types/search.js';
import { Bibframe, JsonLd, type FramedData } from '#lib/types/xl.js';
import type { ReviewItem } from '#lib/contexts/selection.svelte.js';
import type { CSLJSON } from '#lib/types/citation.js';
import type { ApiError } from '#lib/types/api.js';
import { cslFromMainEntity } from '#lib/utils/cslFromMainEntity.js';
import { asSearchResultItem } from '#lib/utils/search.server.js';

/**
 * Fetches a record and returns data needed to support the selection
 * interface (csl, card and work + instances list)
 */
export const getSelectionData = query(
	v.object({
		id: v.string(),
		locale: v.string()
	}),
	async ({ id, locale }) => {
		const { fetch, locals } = getRequestEvent();
		const { display, vocab } = locals;
		const lang = getSupportedLocale(locale);
		let csl: CSLJSON[] | undefined = undefined;
		let card: SearchResultItem | undefined = undefined;
		let work: ReviewItem | undefined = undefined;

		const res = await fetch(`${API_URL}/${id}/data.jsonld?framed=true&computedLabel=${lang}`);

		if (!res.ok) {
			const err = (await res.json()) as ApiError;
			return error(err.status_code, err.message, {
				...(err.error_id && { errorId: err.error_id })
			});
		}

		const record = await res.json();
		const { mainEntity } = record;
		csl = cslFromMainEntity(mainEntity, vocab);

		const isWork = vocab.isSubClassOf(vocab.getType(mainEntity), Bibframe.Work);
		if (isWork) {
			work = {
				id: mainEntity[JsonLd.ID] as string,
				str: mainEntity?.computedLabel ?? ('' as string),
				instances: mainEntity[JsonLd.REVERSE].instanceOf.map((i: FramedData) => {
					return {
						id: i[JsonLd.ID],
						str: i?.computedLabel ?? ('' as string)
					};
				})
			};
		}

		// const mainEntity = centerOnWork(record['mainEntity'] as FramedData);
		// mainEntity.meta = { [JsonLd.ID]: mainEntity[JsonLd.ID] };

		card = asSearchResultItem([mainEntity], display, vocab, lang, AUXD_SECRET)[0];

		return { csl, card, work };
	}
);
