import crypto from 'crypto';
import type {
	SecureImage,
	SecureImageResolution,
	Image,
	KbvImageObject,
	ImageResolution
} from '$lib/types/auxd.types';
import { type FramedData, JsonLd, Owl } from '$lib/types/xl.types';

import { first, isObject, asArray } from '$lib/utils/xl';
import getAtPath from '$lib/utils/getAtPath';
import { relativizeUrl, stripAnchor } from '$lib/utils/http';

function toImage(imageObject: KbvImageObject, recordId: string): Image {
	const mapOne = (i: KbvImageObject) =>
		({
			url: i[JsonLd.ID] || getAtPath(i, [Owl.SAME_AS, 0, JsonLd.ID], undefined),
			widthṔx: Number.parseInt(i.width || ''),
			heightPx: Number.parseInt(i.height || '')
		}) as ImageResolution;

	const sizes = [...(imageObject.thumbnail?.map(mapOne) || []), mapOne(imageObject)];
	sizes.sort((a, b) => a.widthṔx - b.widthṔx);
	return { sizes: sizes, recordId: recordId };
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

export function getImages(thing: FramedData): Image[] {
	return [
		...asArray(thing.image).map((i) =>
			toImage(i as KbvImageObject, stripAnchor(relativizeUrl(thing['@id']) as string))
		),
		...getInstances(thing).flatMap(getImages)
	];
}

export function bestImage(thing: FramedData): Image | undefined {
	return first(getImages(thing));
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
