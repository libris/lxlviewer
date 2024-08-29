import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BOOLEAN_QUALIFIERS, BOOLEAN_QUALIFIER_KEY_TYPE } from '$lib/constants/booleanQualifiers';
import { LxlLens } from '$lib/utils/display.types';
import { type QualifiersResponse } from '$lib/types/autocomplete';

/**
 * Returns processed properties used for super search suggestions
 */

export const GET: RequestHandler = async ({ locals, params }) => {
	const vocabUtil = locals.vocab;
	const displayUtil = locals.display;

	const lang = params?.lang || 'sv';

	const properties = [
		...vocabUtil.getTermByType('Property'),
		...vocabUtil.getTermByType('DatatypeProperty'),
		...vocabUtil.getTermByType('ObjectProperty'),
		...vocabUtil.getTermByType('owl:SymmetricProperty')
	];

	const propertyQualifiers = properties
		.filter((item) => item?.['@id'].includes('https://id.kb.se/vocab/'))
		.map((item) => {
			return {
				name: item?.['@id'].split('/').pop(),
				label: displayUtil.lensAndFormat(item, LxlLens.CardHeading, lang),
				'@type': item?.['@type'],
				item
			};
		});

	const booleanQualifiers = BOOLEAN_QUALIFIERS.map((item) => {
		const langVariants = Object.keys(item.keyByLang).map((lang) => ({
			name: item.keyByLang[lang as keyof typeof item.keyByLang],
			label: item.labelByLang[lang as keyof typeof item.keyByLang],
			'@type': BOOLEAN_QUALIFIER_KEY_TYPE,
			lang
		}));
		return langVariants;
	}).flat();

	const qualifiers = [...propertyQualifiers, ...booleanQualifiers];

	return json(qualifiers as QualifiersResponse, {
		headers: {
			'cache-control': 'public, max-age=300' // Probably best with an short max-age?
		}
	});
};
