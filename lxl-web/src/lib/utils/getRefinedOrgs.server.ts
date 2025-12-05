import type { LibraryId, OrgId } from '$lib/types/holdings';
import type { DisplayMapping } from '$lib/types/search';
import type { MyLibrariesType } from '$lib/types/userSettings';
import { getOrgMembers } from './getLibraries.server';
import { getLibraryIdsFromMapping } from './getLibraryIdsFromMapping';
import { isLibraryOrg } from './holdings';

/**
 * Get orgs and its members currently in search mapping and/or myLibraries
 */
export function getRefinedOrgs(
	myLibraries?: MyLibrariesType,
	mapping: (DisplayMapping[] | undefined)[] = []
): Record<OrgId, LibraryId[]> {
	const mappingIds = getLibraryIdsFromMapping(mapping) ?? {};

	const mappingOrgs = Object.keys(mappingIds).filter(isLibraryOrg);
	const myLibsOrgs = Object.keys(myLibraries ?? {}).filter(isLibraryOrg);

	const orgIds = new Set([...mappingOrgs, ...myLibsOrgs]);

	const result: Record<OrgId, LibraryId[]> = {};
	for (const orgId of orgIds) {
		result[orgId] = getOrgMembers(orgId);
	}

	return result;
}
