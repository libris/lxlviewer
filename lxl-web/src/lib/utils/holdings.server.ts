import type {
	BibIdData,
	BibIdObj,
	HolderLinks,
	HoldersByInstanceId,
	HoldersByType,
	HoldingInstance,
	HoldingMainEntity,
	HoldingsByType,
	LibraryFull,
	LibraryWithLinks
} from '$lib/types/holdings';
import { BibDb, Bibframe, JsonLd, LensType, type FramedData } from '$lib/types/xl';
import { toString, VocabUtil, type DisplayUtil } from '$lib/utils/xl';
import getAtPath from '$lib/utils/getAtPath';
import { getLibrary } from '$lib/utils/getLibraries.server';
import type { LocaleCode } from '$lib/i18n/locales';
import { relativizeUrl, stripAnchor, trimSlashes } from '$lib/utils/http';

type BibDbObj = {
	[JsonLd.TYPE]: string;
	[key: string]: unknown;
};

export function getHoldersByType(holdingsByType: HoldingsByType): HoldersByType {
	return Object.fromEntries(
		Object.entries(holdingsByType).map(([type, holdings]) => {
			const heldBys = holdings.map((h) => h.heldBy[JsonLd.ID]);
			return [type, Array.from(new Set(heldBys))];
		})
	);
}

export function getHoldingsByType(mainEntity: HoldingMainEntity): HoldingsByType {
	const instances = mainEntity[JsonLd.REVERSE]?.instanceOf;
	if (!instances) return {};

	const result: HoldingsByType = {};

	for (const instance of instances) {
		const type = instance[JsonLd.TYPE];
		const items = instance[JsonLd.REVERSE]?.itemOf ?? [];

		if (!result[type]) {
			result[type] = [];
		}
		result[type].push(...items);
	}
	return result;
}

export function getHoldingsByInstanceId(
	data: HoldingMainEntity | HoldingInstance
): HoldersByInstanceId {
	const reverse = data?.[JsonLd.REVERSE];
	const instances =
		reverse && 'instanceOf' in reverse ? reverse.instanceOf : [data as HoldingInstance];
	const result: HoldersByInstanceId = {};

	for (const instance of instances) {
		const id = stripAnchor(trimSlashes(relativizeUrl(instance[JsonLd.ID])));
		if (!id) continue;

		const items = instance[JsonLd.REVERSE]?.itemOf ?? [];
		result[id] = items.map((item) => item.heldBy[JsonLd.ID]);
	}

	return result;
}

export function getBibIdsByInstanceId(
	mainEntity: HoldingMainEntity,
	displayUtil: DisplayUtil,
	record,
	locale: LocaleCode
): BibIdData {
	const instances = mainEntity[JsonLd.REVERSE]?.instanceOf ?? [];
	const result: BibIdData = {};

	for (const instance of instances) {
		const id = stripAnchor(trimSlashes(relativizeUrl(instance[JsonLd.ID])));
		if (!id) continue;

		const type = instance[JsonLd.TYPE];
		// const holders = instance[JsonLd.REVERSE]?.itemOf?.map(item => item?.heldBy?.[JsonLd.ID]) ?? [];

		const publication = instance.publication?.[0];
		const str = publication
			? toString(displayUtil.lensAndFormat(publication, LensType.Token, locale)) || ''
			: '';

		// add Legacy Libris III system number for ONR param
		const onr =
			record?.identifiedBy?.find((el: BibIdObj) => el[JsonLd.TYPE] === 'LibrisIIINumber')?.value ??
			null;

		const identifiers = instance.identifiedBy ?? [];
		const isbn = identifiers.filter((el) => el[JsonLd.TYPE] === 'ISBN').map((el) => el.value);
		const issn = identifiers.filter((el) => el[JsonLd.TYPE] === 'ISSN').map((el) => el.value);
		const bibId = instance.meta?.controlNumber || record?.controlNumber;

		result[id] = {
			bibId,
			[JsonLd.TYPE]: type,
			// holders,
			onr,
			isbn,
			issn,
			str
		};
	}
	return result;
}

/**
 * Get full library data for holders
 */
export function getHoldingLibraries(byType: HoldersByType | HoldersByInstanceId) {
	const holdingLibraries: Record<string, LibraryWithLinks | null> = {};
	for (const type of Object.values(byType)) {
		for (const id of type) {
			if (!(id in holdingLibraries)) {
				holdingLibraries[id] = getLibrary(id);
			}
		}
	}
	return holdingLibraries;
}

/**
 * Create holder-specific links
 */
export function createHolderLinks(
	fullHolderData: LibraryFull,
	locale: LocaleCode,
	displayUtil: DisplayUtil
): HolderLinks {
	const linksToCatalog = getAtPath(fullHolderData, [BibDb.ils, 'url'], undefined);
	const linksToSite = getAtPath(fullHolderData, ['url', JsonLd.ID], undefined);

	const myLoansLink =
		pathByLang(getAtPath(fullHolderData, [BibDb.lopac, BibDb.myLoansUriLang], undefined), locale) ||
		'';

	const registrationLink =
		pathByLang(
			getAtPath(fullHolderData, [BibDb.lopac, BibDb.patronRegistrationUriByLang], undefined),
			locale
		) || '';

	const openingHours = getAtPath(fullHolderData, [BibDb.openingHours], undefined);
	const addresses: string[] = [];
	const address: BibDbObj[] = getAtPath(fullHolderData, [BibDb.address, '*'], undefined) || [];
	const postalAddress = address.find((a) => a[JsonLd.TYPE] === BibDb.postalAddress) as FramedData;
	const addressLocality = postalAddress?.[BibDb.addressLocality] as string | undefined;
	const visitingAddress = address.find(
		(a) => a[JsonLd.TYPE] === BibDb.visitingAddress
	) as FramedData;

	if (address && address.length) {
		addresses.push(
			toString(displayUtil.lensAndFormat(visitingAddress, LensType.Card, locale)) || ''
		);
		addresses.push(toString(displayUtil.lensAndFormat(postalAddress, LensType.Card, locale)) || '');
	}
	return {
		address: addresses,
		linksToSite: linksToSite?.length ? [linksToSite] : [],
		linksToCatalog: linksToCatalog?.length ? [linksToCatalog] : [],
		myLoansLink,
		registrationLink,
		openingHours: openingHours?.length ? [openingHours] : [],
		addressLocality
	};
}

function pathByLang(thing: Record<LocaleCode, string>, locale: LocaleCode) {
	if (thing) {
		if (thing?.[locale]) {
			return thing[locale];
		} else if (thing['sv']) {
			return thing['sv'];
		}
	}
	return null;
}

export function getHoldersCount(
	data: HoldingMainEntity | HoldingInstance,
	vocabUtil: VocabUtil
): number {
	const type = vocabUtil.getType(data);
	if (
		!type ||
		!(
			vocabUtil.isSubClassOf(type, Bibframe.Work) || vocabUtil.isSubClassOf(type, Bibframe.Instance)
		)
	) {
		return -1;
	}

	// data can be a work mainEntity or an instance
	const reverse = data[JsonLd.REVERSE];
	const instances: HoldingInstance[] =
		reverse && 'instanceOf' in reverse ? reverse.instanceOf : [data as HoldingInstance];

	const holders = new Set<string>();

	for (const instance of instances) {
		const itemOf = instance[JsonLd.REVERSE]?.itemOf ?? [];
		for (const item of itemOf) {
			const heldById = item.heldBy?.[JsonLd.ID];
			if (heldById) holders.add(heldById);
		}
	}

	return holders.size;
}
