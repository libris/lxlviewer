import jmespath from 'jmespath';
import type { CSLJSON, CSLName, CSLType } from '$lib/types/citation';
import type { FramedData } from '$lib/types/xl';
import getTypeLike, { getTypeForIcon } from './getTypeLike';
import type { VocabUtil } from './xl';

const CSL_KBV_MAPPING: Record<keyof CSLJSON, string> = {
	id: `"@id"`,
	type: `instanceOf."@type"`,
	title: `hasTitle[0].computedLabel`,
	shortTitle: `hasTitle[0].mainTitle`,
	'container-title': `join(', ', isPartOf[].hasTitle[0].computedLabel)`,
	publisher: `join(', ', publication[].agent.computedLabel)`,
	'publisher-place': `join(', ', publication[].place[].computedLabel)`,
	issued: `{"date-parts": [[ (publication[0].year || '') ]] }`,
	'number-of-pages': `join(', ', extent[].computedLabel)`,
	edition: `editionStatement`,
	language: `join(', ', instanceOf.language[].computedLabel)`,
	DOI: `join(', ', identifiedBy[?"@type"=='DOI'].value)`,
	ISBN: `join(', ', identifiedBy[?"@type"=='ISBN'].value)`,
	ISSN: `join(', ', identifiedBy[?"@type"=='ISSN'].value)`,
	URL: `join(', ', associatedMedia[*].uri[])`,
	abstract: `join(', ', summary[].computedLabel)`,
	keyword: `join(', ', instanceOf.subject[].computedLabel)`,
	issue: `part`,
	volume: `join(', ', [?"@type"=='Serial'].part[?"@type"=='Monograph'].mainEntity.hasTitle[].hasPart[].partNumber)`,

	author: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/author')].{family: agent.familyName, given: agent.givenName}`,
	editor: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/editor')].{family: agent.familyName, given: agent.givenName}`,
	composer: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/composer')].{family: agent.familyName, given: agent.givenName}`,
	director: `instanceOf.contribution[?(contains((role[]."@id" || [role."@id"]),'https://id.kb.se/relator/filmDirector') || contains((role[]."@id" || [role."@id"]),'https://id.kb.se/relator/director') || contains((role[]."@id" || [role."@id"]),'https://id.kb.se/relator/televisionDirector'))].{family: agent.familyName, given: agent.givenName}`,
	illustrator: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/illustrator')].{family: agent.familyName, given: agent.givenName}`,
	interviewer: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/interviewer')].{family: agent.familyName, given: agent.givenName}`,
	translator: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/translator')].{family: agent.familyName, given: agent.givenName}`
};

// const TYPE_MAP: Record<string, CSLType> = {
// 	Monograph: 'book',
// 	Serial: 'periodical'
// 	// more...
// };

export function cslFromMainEntity(mainEntity: FramedData, vocabUtil: VocabUtil): CSLJSON[] {
	const result: Partial<CSLJSON> = {};

	for (const [key, expr] of Object.entries(CSL_KBV_MAPPING) as [keyof CSLJSON, string][]) {
		try {
			const value = jmespath.search(mainEntity, expr);
			if (value) {
				result[key] = value;
			}
		} catch {
			continue;
		}
	}

	// Look for PrimaryContribution to put as author as fallback
	if (!result?.author?.length) {
		let PrimaryContribution: CSLName[] | undefined;
		try {
			PrimaryContribution = jmespath.search(
				mainEntity,
				`instanceOf.contribution[?"@type"=='PrimaryContribution'].{family: agent.familyName, given: agent.givenName}`
			);
		} catch {
			// do nothing
		}

		if (PrimaryContribution) {
			result.author = PrimaryContribution;
		}
	}

	const typeForIcon = getTypeForIcon(getTypeLike(mainEntity.instanceOf, vocabUtil));
	console.log(typeForIcon); // use this instead?
	// result.type = TYPE_MAP[typeForIcon as string] ?? 'book';
	// console.log(mainEntity.instanceOf._categoryByCollection?.find?.[0]?.['@id']);

	result.type = getCslType(mainEntity);

	return [result as CSLJSON];
}

function getCslType(mainEntity: FramedData): CSLType | undefined {
	const type = mainEntity?.instanceOf?.['@type'] as string;
	const category = mainEntity?.instanceOf?.category;
	if (type === 'Monograph') {
		if (category && Array.isArray(category)) {
			if (category.some((c) => c?.['@id'] === 'https://id.kb.se/term/rda/Text')) {
				if (category.some((c) => c?.['@id'] === 'https://id.kb.se/term/ktg/ComponentPart')) {
					return 'article';
				} else return 'book';
			}

			if (category.some((c) => c?.['@id'] === 'https://id.kb.se/term/saogf/Kartor')) {
				return 'map';
			} else if (category.some((c) => c?.['@id'] === 'https://id.kb.se/term/ktg/MovingImage')) {
				// not correct for all moving image?
				return 'motion_picture';
			} else if (category.some((c) => c?.['@id'] === 'https://id.kb.se/term/rda/ComputerProgram')) {
				return 'software';
			} else if (category.some((c) => c?.['@id'] === 'https://id.kb.se/term/rda/StillImage')) {
				return 'graphic';
			}
		}
	} else if (type === 'Serial') {
		// periodical
		if (category && Array.isArray(category)) {
			if (category.some((c) => c?.['@id'] === 'https://id.kb.se/term/rda/Text')) {
				return 'periodical';
			}
		}
	}
	return 'unknown';
}
