import * as v from 'valibot';
import { getRequestEvent, query } from '$app/server';
import { API_URL, AUXD_SECRET } from '$app/env/private';
import { getSupportedLocale } from '#lib/i18n/locales.js';
import { error } from '@sveltejs/kit';
import type { SearchResultItem } from '#lib/types/search.js';
import { Bibframe, JsonLd, LensType, type FramedData } from '#lib/types/xl.js';
import type { ReviewItem } from '#lib/contexts/selection.svelte.js';
import type { CSLJSON } from '#lib/types/citation.js';
import type { ApiError } from '#lib/types/api.js';
import { cslFromMainEntity } from '#lib/utils/cslFromMainEntity.js';
import { asSearchResultItem } from '#lib/utils/search.server.js';
import { centerOnWork } from '#lib/utils/centerOnWork.server.js';
import { toString } from '#lib/utils/misc.js';
import { getSortedInstances } from '#lib/utils/getSortedInstances.server.ts';

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
		let { mainEntity } = record;
		csl = cslFromMainEntity(mainEntity, vocab);

		const isWork = vocab.isSubClassOf(vocab.getType(mainEntity), Bibframe.Work);
		if (isWork) {
			work = {
				id: mainEntity[JsonLd.ID] as string,
				str: mainEntity?.computedLabel ?? ('' as string),
				instances: formatInstances(mainEntity)
			};
		}

		function formatInstances(mainEntity: FramedData) {
			const reverse = mainEntity[JsonLd.REVERSE] as FramedData;
			const sortedInstances = getSortedInstances(reverse.instanceOf as FramedData[]);
			sortedInstances.forEach(
				(i) =>
					(i[Bibframe.instanceOf] = {
						[JsonLd.TYPE]: mainEntity[JsonLd.TYPE],
						_categoryByCollection: mainEntity._categoryByCollection
					})
			);
			return asSearchResultItem({
				items: sortedInstances,
				displayUtil: display,
				vocabUtil: vocab,
				locale: lang,
				auxdSecret: AUXD_SECRET
			}).map((i) => {
				return {
					id: i[JsonLd.ID],
					str: `${i.selectTypeStr} · ${toString(i[LensType.WebCardFooter])}`
				};
			});
		}
		mainEntity = centerOnWork(record['mainEntity'] as FramedData);
		mainEntity.meta = { [JsonLd.ID]: record?.[JsonLd.ID] };

		card = asSearchResultItem({
			items: [mainEntity],
			displayUtil: display,
			vocabUtil: vocab,
			locale: lang,
			auxdSecret: AUXD_SECRET
		})[0];

		return { csl, card, work };
	}
);
