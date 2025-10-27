import jmespath from 'jmespath';
import type { CSLJSON, CSLName, CSLType } from '$lib/types/citation';
import { JsonLd, type FramedData } from '$lib/types/xl';
import getTypeLike, { slug, type TypeLike } from './getTypeLike';
import type { VocabUtil } from './xl';

const agentPicker = `{family: agent.familyName, given: agent.givenName, literal: agent.name}`;

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

	author: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/author')].${agentPicker}`,
	editor: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/editor')].${agentPicker}`,
	composer: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/composer')].${agentPicker}`,
	director: `instanceOf.contribution[?(contains((role[]."@id" || [role."@id"]),'https://id.kb.se/relator/filmDirector') || contains((role[]."@id" || [role."@id"]),'https://id.kb.se/relator/director') || contains((role[]."@id" || [role."@id"]),'https://id.kb.se/relator/televisionDirector'))].${agentPicker}`,
	illustrator: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/illustrator')].${agentPicker}`,
	interviewer: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/interviewer')].${agentPicker}`,
	translator: `instanceOf.contribution[?contains((role[]."@id" || [role."@id"]), 'https://id.kb.se/relator/translator')].${agentPicker}`
};

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

	// Put other contributors as author fallback
	if (!result?.author?.length) {
		let constributors: CSLName[] | undefined;
		try {
			constributors = jmespath.search(
				mainEntity,
				`instanceOf.contribution[?"@type"=='PrimaryContribution'].${agentPicker}`
			);
			if (!constributors?.length) {
				constributors = jmespath.search(
					mainEntity,
					`instanceOf.contribution[?"@type"=='Contribution'].${agentPicker}`
				);
				result.author = constributors;
			}
		} catch {
			// do nothing
		}
	}

	result.type = getCslType(mainEntity, vocabUtil);

	return [result as CSLJSON];
}

// see https://github.com/citation-style-language/schema/blob/master/schemas/input/csl-data.json
function getCslType(mainEntity: FramedData, vocabUtil: VocabUtil): CSLType {
	const instanceTypes = typeLikeArr(getTypeLike(mainEntity as FramedData, vocabUtil));
	const workTypes = mainEntity?.instanceOf
		? typeLikeArr(getTypeLike(mainEntity?.instanceOf as FramedData, vocabUtil))
		: [];
	const allTypes = [...instanceTypes, ...workTypes];

	allTypes.push(mainEntity?.instanceOf?.[JsonLd.TYPE]);

	if (allTypes.includes('Monograph')) {
		if (allTypes.includes('Text')) {
			if (allTypes.includes('ComponentPart')) {
				return 'article';
			}
			if (allTypes.includes('Thesis')) {
				return 'thesis';
			} else {
				return 'book';
			}
		} else if (allTypes.includes('Ljudb%C3%B6cker')) {
			return 'book';
		} else if (allTypes.includes('Software')) {
			return 'software';
		} else if (allTypes.includes('Music') && allTypes.includes('NotatedMusic')) {
			return 'musical_score';
		} else if (allTypes.includes('StillImage')) {
			return 'graphic';
		} else if (allTypes.includes('MovingImage')) {
			if (allTypes.includes('Tv-program')) {
				return 'broadcast';
			} else return 'motion_picture';
		} else if (allTypes.includes('Cartography')) {
			return 'map';
		}
	} else if (allTypes.includes('Serial') && allTypes.includes('Text')) {
		return 'periodical';
	} else if (allTypes.includes('Collection') {
	  return 'collection';
	}

	// fallback?
	return 'document';
}

function typeLikeArr(typeLike: TypeLike): (string | undefined)[] {
	return Object.values(typeLike)?.flatMap((value) => value.flatMap((v) => slug(v?.[JsonLd.ID])));
}
