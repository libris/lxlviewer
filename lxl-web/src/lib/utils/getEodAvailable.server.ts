import type { EodAvailable, LibraryWithLinks } from '$lib/types/holdings';
import { BibDb, JsonLd, type FramedData } from '$lib/types/xl';

const YEARS_OLD_ENOUGH = 90;

/**
 * If resource meets criteria, return a list of holding libraries where you can request digitization
 */
export function getEodAvailable(
	instances: FramedData[],
	holdingLibraries: Record<string, LibraryWithLinks | null>,
	controlNumber: string
): EodAvailable {
	if (instances.length === 1 && isPrint(instances[0])) {
		// single instance, print
		const publication = Array.isArray(instances[0]?.publication)
			? instances[0]?.publication[0]
			: instances[0]?.publication;
		if (isOldEnough(publication?.year)) {
			// old enough
			const eodLibs = getEodLibs(holdingLibraries, controlNumber);
			if (eodLibs?.length) {
				// holding libraries supporting eod
				return eodLibs;
			}
		}
	}
	return null;
}

function isPrint(instance: FramedData) {
	return instance?.category?.find(
		(c: FramedData) => c[JsonLd.ID] === 'https://id.kb.se/term/saobf/Print'
	);
}

function isOldEnough(publicationYear: string | undefined) {
	if (publicationYear && typeof publicationYear === 'string') {
		const yearParsed = parseInt(publicationYear, 10);

		if (Number.isNaN(yearParsed)) {
			return false;
		}

		const currentYear = new Date().getFullYear();
		return yearParsed < currentYear - YEARS_OLD_ENOUGH;
	}
	return false;
}

function getEodLibs(libs: Record<string, LibraryWithLinks | null>, id: string): EodAvailable {
	if (libs && id) {
		return Object.values(libs)
			.filter((l) => l?.[BibDb.eodUri])
			.map((l) => {
				return {
					[BibDb.eodUri]: createEodLink(l?.[BibDb.eodUri] as string, id),
					displayStr: l?.displayStr as string
				};
			});
	}
	return null;
}

function createEodLink(linkTemplateEod: string, id: string) {
	return linkTemplateEod.replace(/%BIB_*ID%/, id);
}
