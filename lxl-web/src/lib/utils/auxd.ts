import crypto from 'crypto';
import { first, type FramedData, JsonLd, Owl } from '$lib/utils/xl';
import {
	type AuthImage,
	type AuthImageResolution,
	type Image,
	type KbvImageObject,
	type ImageResolution,
	isImage,
	isImageResolution
} from '$lib/utils/auxd.types';
import getAtPath from '$lib/utils/getAtPath';
import { relativizeUrl, stripAnchor } from '$lib/utils/http';

function toImage(imageObject: KbvImageObject, recordId: string): Image {
	const map1 = (i: KbvImageObject) =>
		({
			url: i[JsonLd.ID] || i[Owl.SAME_AS][0][JsonLd.ID],
			widthṔx: Number.parseInt(i.width || ''),
			heightPx: Number.parseInt(i.height || '')
		}) as ImageResolution;

	const sizes = [...(imageObject.thumbnail?.map(map1) || []), map1(imageObject)];
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

export function auxdAuth(i: undefined, secret: string): undefined;
export function auxdAuth(i: Image, secret: string): AuthImage;
export function auxdAuth(i: ImageResolution, secret: string): AuthImageResolution;
export function auxdAuth(
	i: Image | ImageResolution | undefined,
	secret: string
): AuthImage | AuthImageResolution | undefined {
	if (isImageResolution(i)) {
		return { ...i, url: generateAuxdImageUri(calculateExpirationTime(), i.url, secret) };
	} else if (isImage(i)) {
		return { ...i, sizes: i.sizes.map((s) => auxdAuth(s, secret)) as AuthImageResolution[] };
	}
	return undefined;
}

export function calculateExpirationTime() {
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);
	return Math.floor(startOfDay.valueOf() / 1000) + 3600 * 24 * 2; // start of day + 2 days
}

export function generateAuxdImageUri(expires, url, secret) {
	if (!url) {
		return '';
	}
	const parsedUrl = new URL(url);
	const key = generateImageHash(expires, parsedUrl.pathname, secret);
	return `${parsedUrl.origin}${parsedUrl.pathname}?key=${key}&expires=${expires}`;
}

function generateImageHash(expires, url, secret) {
	const input = `${expires} ${url} ${secret}`;
	const binaryHash = crypto.createHash('md5').update(input).digest();
	const base64Value = Buffer.from(binaryHash).toString('base64');
	return base64Value.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function asArray<V>(v: V | Array<V>): Array<V> | [] {
	return Array.isArray(v) ? v : v === null || v === undefined ? [] : [v];
}
