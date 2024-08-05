import crypto from 'crypto';
import type {
	SecureImage,
	SecureImageResolution,
	Image,
	KbvImageObject,
	ImageResolution
} from '$lib/types/auxd';
import { Concepts, type FramedData, JsonLd, Owl } from '$lib/types/xl';
import { first, isObject, asArray } from '$lib/utils/xl';
import getAtPath from '$lib/utils/getAtPath';
import { relativizeUrl, stripAnchor } from '$lib/utils/http';
import type { LocaleCode } from '$lib/i18n/locales';

function toImage(imageObject: KbvImageObject, recordId: string, lang: LocaleCode): Image {
	const mapOne = (i: KbvImageObject) =>
		({
			url: i[JsonLd.ID] || getAtPath(i, [Owl.SAME_AS, 0, JsonLd.ID], undefined),
			widthṔx: Number.parseInt(i.width || ''),
			heightPx: Number.parseInt(i.height || '')
		}) as ImageResolution;

	const sizes = [...(imageObject.thumbnail?.map(mapOne) || []), mapOne(imageObject)];
	sizes.sort((a, b) => a.widthṔx - b.widthṔx);

	const attribution = getAttribution(imageObject);
	const usageAndAccessPolicy = getUsageAndAccessPolicy(imageObject, lang);
	return { sizes: sizes, recordId, attribution, usageAndAccessPolicy };
}

export function bestSize(from: Image, minWidthPx: number): ImageResolution;
export function bestSize(from: undefined, minWidthPx: number): undefined;
export function bestSize(from: Image | undefined, minWidthPx: number): ImageResolution | undefined {
	if (from === undefined) {
		return undefined;
	}
	const sizes = from.sizes;
	const result = sizes.find((i) => i.widthṔx >= minWidthPx);
	return result || sizes[sizes.length - 1];
}

export function getImages(thing: FramedData, lang: LocaleCode): Image[] {
	return [
		...asArray(thing.image).map((i) =>
			toImage(i as KbvImageObject, stripAnchor(relativizeUrl(thing['@id']) as string), lang)
		),
		...getInstances(thing).flatMap((instance) => getImages(instance, lang))
	];
}

export function bestImage(thing: FramedData, lang: LocaleCode): Image | undefined {
	return first(getImages(thing, lang));
}

function getInstances(thing: FramedData): FramedData[] {
	return getAtPath(thing, ['@reverse', 'instanceOf', '*'], []);
}

export function toSecure(i: undefined, secret: string): undefined;
export function toSecure(i: Image, secret: string): SecureImage;
export function toSecure(i: ImageResolution, secret: string): SecureImageResolution;
export function toSecure(
	i: Image | ImageResolution | undefined,
	secret: string
): SecureImage | SecureImageResolution | undefined {
	if (isImageResolution(i)) {
		return { ...i, url: generateSecureLink(calculateExpirationTime(), i.url, secret) };
	} else if (isImage(i)) {
		return { ...i, sizes: i.sizes.map((s) => toSecure(s, secret)) as SecureImageResolution[] };
	}
	return undefined;
}

function getAttribution(imageObject: KbvImageObject): { name: string; link?: string } | undefined {
	if (!Array.isArray(imageObject.publisher)) {
		return undefined;
	}

	const attribution = imageObject.publisher.find((publisherItem) => publisherItem.name);
	if (attribution) {
		const name = attribution.name;
		const link = attribution?.[Concepts.exactMatch]?.[JsonLd.ID];
		return {
			name,
			link
		};
	}
	return undefined;
}

function getUsageAndAccessPolicy(imageObject: KbvImageObject, lang: LocaleCode) {
	if (
		asArray(imageObject.publisher).find((publisherItem) => publisherItem?.[JsonLd.ID] === 'nielsen')
	) {
		return {
			title:
				'Copyright in any data cover images supplied by Nielsen Book Services Limited is held by Nielsen Book Services Limited or by the publishers or by their respective licensors: all rights reserved'
		};
	}

	if (imageObject.usageAndAccessPolicy) {
		const title = imageObject.usageAndAccessPolicy?.[0]?.titleByLang?.[lang];
		const link = imageObject.usageAndAccessPolicy?.[0]?.['@id'] as string | undefined;
		const identifier = imageObject.usageAndAccessPolicy?.[0]?.['identifier'] as string | undefined;

		return {
			title,
			link,
			identifier
		};
	}

	return {
		title:
			lang === 'en'
				? 'The cover pictures and other pictures that are shown in LIBRIS are protected according to the Swedish Act on Copyright for Literary and Artistic Works (1960:729). There are also pictures that are not copyrighted. Anyone using LIBRIS is therefore not permitted to download or in any other way have the pictures at their disposal. It is the users responsibility to check if the material is copyrighted.'
				: 'Omslagsbilder och andra bilder som visas i LIBRIS är i regel skyddade enligt lag (1960:729) om upphovsrätt till litterära och konstnärliga verk. Den som nyttjar LIBRIS får inte ladda ner eller på något annat sätt förfoga över bilder som är skyddade av upphovsrätt. Det finns också bilder som inte är skyddade av upphovsrätt. Det är du som användare som ansvarar för att ta reda på om materialet är upphovsrättsligt skyddat eller inte.'
	};
}
export function calculateExpirationTime() {
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);
	return Math.floor(startOfDay.valueOf() / 1000) + 3600 * 24 * 2; // start of day + 2 days
}

// https://www.nginx.com/blog/securing-urls-secure-link-module-nginx-plus/
export function generateSecureLink(expires, url, secret) {
	if (!url) {
		return '';
	}
	const parsedUrl = new URL(url);
	const key = generateImageHash(expires, parsedUrl.pathname, secret);
	return `${parsedUrl.origin}${parsedUrl.pathname}?key=${key}&expires=${expires}`;
}

export function isImage(v: unknown): v is Image {
	return isObject(v) && 'sizes' in v && 'recordId' in v;
}

export function isImageResolution(v: unknown): v is ImageResolution {
	return isObject(v) && 'url' in v && 'widthṔx' in v && 'heightPx' in v;
}

function generateImageHash(expires, url, secret) {
	const input = `${expires} ${url} ${secret}`;
	const binaryHash = crypto.createHash('md5').update(input).digest();
	const base64Value = Buffer.from(binaryHash).toString('base64');
	return base64Value.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
