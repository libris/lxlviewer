import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BOOLEAN_QUALIFIERS, BOOLEAN_QUALIFIER_TYPE } from '$lib/constants/booleanQualifiers';
import { LxlLens } from '$lib/utils/display.types';
import { type Qualifiers } from '$lib/types/qualifier';
import { toString } from '$lib/utils/xl';
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

	const propertyQualifiers: Qualifiers = properties
		.filter((item) => item?.['@id'].includes('https://id.kb.se/vocab/'))
		.reduce((acc, currentItem) => {
			const name = currentItem?.['@id'].split('/').pop();
			if (name) {
				return {
					...acc,
					[name]: {
						'@id': currentItem['@id'],
						'@type': currentItem['@type'],
						label: toString(
							displayUtil.lensAndFormat(currentItem, LxlLens.CardHeading, lang)
						).replace(new RegExp(/\s•\s$/), '') // temporarily replacing extra bullet points at end (should be reomved when source is fixed)
					}
				};
			}
			return acc;
		}, []);

	const booleanQualifiers: Qualifiers = BOOLEAN_QUALIFIERS.reduce((acc, currentItem) => {
		const langVariants: Qualifiers = Object.keys(currentItem.keyByLang).reduce(
			(variantAcc, currentVariantLang) => ({
				...variantAcc,
				[currentItem.keyByLang[currentVariantLang as keyof typeof currentItem.keyByLang]]: {
					'@id': undefined,
					'@type': BOOLEAN_QUALIFIER_TYPE,
					label: currentItem.labelByLang[lang as keyof typeof currentItem.keyByLang],
					decscription: currentItem.descriptionByLang[lang as keyof typeof currentItem.keyByLang]
				}
			}),
			{}
		);
		return {
			...acc,
			...langVariants
		};
	}, {});

	const qualifiers = {
		...propertyQualifiers,
		...booleanQualifiers
	};

	return json(qualifiers as Qualifiers, {
		headers: {
			'cache-control': 'public, max-age=300' // Probably best with an short max-age?
		}
	});
};
