import jmespath from 'jmespath';
import type { CSLJSON, CSLName, CSLType } from '$lib/types/citation';
import { JsonLd, type FramedData } from '$lib/types/xl';
import getTypeLike, { slug, type TypeLike } from './getTypeLike';
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

	result.type = getCslType(mainEntity, vocabUtil);

	return [result as CSLJSON];
}

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
			} else {
				return 'book';
			}
		} else if (allTypes.includes('Ljudb%C3%B6cker')) {
			return 'book';
		} else if (allTypes.includes('StillImage')) {
			return 'graphic';
		} else if (allTypes.includes('MovingImage')) {
			return 'motion_picture';
		} else if (allTypes.includes('Cartography')) {
			return 'map';
		} else if (allTypes.includes('Software')) {
			return 'software';
		}
	} else if (allTypes.includes('Serial') && allTypes.includes('Text')) {
		return 'periodical';
	}

	// fallback?
	return 'document';
}

function typeLikeArr(typeLike: TypeLike): (string | undefined)[] {
	return Object.values(typeLike)?.flatMap((value) => value.flatMap((v) => slug(v?.[JsonLd.ID])));
}
