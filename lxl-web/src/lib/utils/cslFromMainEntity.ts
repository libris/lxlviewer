import jmespath from 'jmespath';
import type { CSLJSON, CSLName, CSLRoles, CSLType } from '$lib/types/citation';
import { JsonLd, type FramedData } from '$lib/types/xl';
import getTypeLike, { slug, type TypeLike } from './getTypeLike';
import type { VocabUtil } from './xl';

const CSL_KBV_MAPPING: Partial<Record<keyof CSLJSON, string>> = {
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
	volume: `join(', ', [?"@type"=='Serial'].part[?"@type"=='Monograph'].mainEntity.hasTitle[].hasPart[].partNumber)`
};

interface Contributor {
	'@type'?: string;
	role?: { '@id'?: string }[];
	agent: Agent | Agent[];
}

interface Agent {
	familyName?: string;
	givenName?: string;
	name?: string;
}

export function cslFromMainEntity(mainEntity: FramedData, vocabUtil: VocabUtil): CSLJSON[] {
	let result: Partial<CSLJSON> = {};

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

	const contributors = mapContribution(mainEntity.instanceOf?.contribution as Contributor[]);
	result = { ...result, ...contributors };
	result.type = getCslType(mainEntity, vocabUtil);

	return [result as CSLJSON];
}

function mapContribution(contribution: Contributor[]): Partial<CSLJSON> {
	const result: Partial<CSLJSON> = {};

	if (contribution && Array.isArray(contribution)) {
		for (const contributor of contribution) {
			const roleEntry = getRole(contributor);
			if (roleEntry) {
				for (const [role, name] of Object.entries(roleEntry) as [keyof CSLRoles, CSLName[]][]) {
					addContributor(result, role, name);
				}
			} else {
				const fallbackRole = getFallbackRole(contributor);
				if (fallbackRole) {
					addContributor(result, 'author', fallbackRole);
				}
			}
		}
	}
	return result;
}

function addContributor(result: Partial<CSLJSON>, role: keyof CSLRoles, names: CSLName[]) {
	if (Array.isArray(result[role])) {
		result[role].push(...names);
	} else {
		result[role] = names;
	}
}

function getRole(contributor: Contributor): Partial<CSLRoles> | false {
	if (contributor.role) {
		let role: string | undefined = contributor.role?.[0]?.['@id'];
		if (role) {
			role = role.replace('https://id.kb.se/relator/', '');
			const name = getName(contributor.agent);
			switch (role) {
				case 'author':
					return { author: name };
				case 'editor':
					return { editor: name };
				case 'composer':
					return { composer: name };
				case 'filmDirector':
				case 'director':
					return { director: name };
				case 'illustrator':
					return { illustrator: name };
				case 'interviewer':
					return { interviewer: name };
				case 'translator':
					return { translator: name };
				case 'producer':
				case 'filmProducer':
					return { producer: name };
				case 'narrator':
					return { narrator: name };
				case 'performer':
				case 'musician':
				case 'singer':
				case 'arranger':
					return { performer: name };
				case 'compiler':
					return { compiler: name };
				case 'curator':
					return { curator: name };
				default:
					return false;
			}
		}
	}
	return false;
}

function getFallbackRole(contributor: Contributor) {
	if (contributor['@type'] === 'PrimaryContribution' || contributor['@type'] === 'Contribution') {
		const name = getName(contributor.agent);
		if (name) {
			return name;
		}
	}
	return false;
}

function getName(agent: Agent | Agent[]): CSLName[] {
	const flattenedAgent = Array.isArray(agent) ? agent[0] : agent;
	const name: Partial<CSLName> = {};
	if (flattenedAgent.familyName) {
		name.family = flattenedAgent.familyName;
	}
	if (flattenedAgent.givenName) {
		name.given = flattenedAgent.givenName;
	}
	if (flattenedAgent.name) {
		name.literal = flattenedAgent.name;
	}
	return [name as CSLName];
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
				return 'article-journal';
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
	} else if (allTypes.includes('Collection')) {
		return 'collection';
	}

	// fallback?
	return 'document';
}

function typeLikeArr(typeLike: TypeLike): (string | undefined)[] {
	return Object.values(typeLike)?.flatMap((value) => value.flatMap((v) => slug(v?.[JsonLd.ID])));
}
