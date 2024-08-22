import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PropertySuggestion } from '$lib/types/suggestions';

/**
 * Returns processed properties used for super search suggestions
 */

export const GET: RequestHandler = async ({ locals }) => {
	const vocabUtil = locals.vocab;
	const properties = [
		...vocabUtil.getTermByType('Property'),
		...vocabUtil.getTermByType('DatatypeProperty'),
		...vocabUtil.getTermByType('ObjectProperty'),
		...vocabUtil.getTermByType('owl:SymmetricProperty')
	];

	const processedProperties = properties.map((item) => {
		const key =
			item?.isDefinedBy?.['@id'] === 'https://id.kb.se/vocab/' ||
			item?.['@id'].includes('https://id.kb.se/marc/') // unsure if we should treat marc the same as vocab...
				? item?.['@id'].split('/').pop() // use last part of id if part of base vocabulary
				: item['@id'];

		return {
			'@id': item?.['@id'],
			'@type': item?.['@type'],
			labelByLang: item?.labelByLang || undefined,
			key
		};
	});

	return json(processedProperties as PropertySuggestion[]);
};
