import * as DisplayUtil from 'lxljs/display';
import getFnurgelFromUri from '$lib/utils/getFnurgelFromUri';

function getRecordContributions(record, resources) {
	/** TODO: Investigate if we can get resources automatically from layout or context */
	return record.contribution
		?.map((contribution) => {
			const agent = Array.isArray(contribution.agent) ? contribution.agent[0] : contribution.agent;
			return {
				role:
					contribution.role &&
					(Array.isArray(contribution.role)
						? contribution.role?.map((role) =>
								DisplayUtil.getItemLabel(role, resources, {}, { language: 'sv' })
						  )
						: DisplayUtil.getItemLabel(contribution.role, resources, {}, { language: 'sv' })),
				agent: DisplayUtil.getItemLabel(agent, resources, {}, { language: 'sv' }),
				fnurgel: agent['@id'] ? getFnurgelFromUri(agent['@id']) : undefined,
				isPrimary:
					contribution['@type'] === 'PrimaryContribution' ||
					contribution.role?.some(
						(role) => role['@id'] === 'http://id.kb.se/relator/primaryRightsHolder'
					)
			};
		})
		.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

export default getRecordContributions;
