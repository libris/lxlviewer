import type { LibOrg, OrgId } from '$lib/types/holdings';
import type { DisplayMapping } from '$lib/types/search';
import type { MyLibrariesType } from '$lib/types/userSettings';
import { getOrg } from './getLibraries.server';
import { getLibraryIdsFromMapping } from './getLibraryIdsFromMapping';
import { isLibraryOrg } from './holdings';

/**
 * Get orgs and its members currently in search mapping and/or myLibraries
 */
export function getRefinedOrgs(
	libraries?: MyLibrariesType,
	mapping: (DisplayMapping[] | undefined)[] = []
): Record<OrgId, LibOrg> {
	const mappingIds = getLibraryIdsFromMapping(mapping) ?? {};

	const mappingOrgs = Object.keys(mappingIds).filter(isLibraryOrg);
	const myLibsOrgs = Object.keys(libraries ?? {}).filter(isLibraryOrg);

	const orgIds = new Set([...mappingOrgs, ...myLibsOrgs]);

	const result: Record<OrgId, LibOrg> = {};
	for (const orgId of orgIds) {
		const org = getOrg(orgId);
		if (org) {
			result[orgId] = org;
		}
	}

	return result;
}
