import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	globalVocabUtil as vocabUtil,
	globalDisplayUtil as displayUtil
} from '../../../../hooks.server';
import { LxlLens } from '$lib/utils/display.types';
import { toString } from '$lib/utils/xl';
import VALID_QUALIFIER_TYPES from '$lib/assets/json/validQualifierTypes.json';

export type QualifierTypeResponse = {
	type: string;
	label: string;
	preferLinks: boolean;
}[];

export const GET: RequestHandler = async ({ params }) => {
	const lang = params.lang || 'sv';

	const qualifierTypes: QualifierTypeResponse = VALID_QUALIFIER_TYPES.map((validQualifier) => {
		const { type, baseClass, property, preferLinks } = validQualifier;

		const definition = vocabUtil.getDefinition(baseClass || property);

		return {
			type,
			label: toString(displayUtil.lensAndFormat(definition, LxlLens.CardHeading, lang)) || type,
			preferLinks
		};
	});

	return json(qualifierTypes, {
		headers: {
			'cache-control': 'public, max-age=300' // Probably best with an short max-age?
		}
	});
};
