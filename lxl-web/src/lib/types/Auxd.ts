import { isObject, JsonLd, type Link, Owl } from '$lib/utils/xl';

type SizePx = `${number}px`;

type SecureLink = string;

export interface KbvImageObject {
	[JsonLd.ID]?: string;
	[Owl.SAME_AS]?: Link[];
	width?: SizePx;
	height?: SizePx;
	thumbnail?: KbvImageObject[];
}

export enum Width {
	X_SMALL = 64,
	SMALL = 128,
	MEDIUM = 256,
	FULL = 99999
}

export interface ImageResolution {
	url: string;
	widthṔx: number;
	heightPx: number;
}

export interface SecureImageResolution extends ImageResolution {
	url: SecureLink;
}

export interface Image {
	sizes: ImageResolution[]; // always ordered smallest to largest
	recordId: string;
}

export interface SecureImage extends Image {
	sizes: SecureImageResolution[];
}

export function isImage(v: unknown): v is Image {
	return isObject(v) && 'sizes' in v && 'recordId' in v;
}

export function isImageResolution(v: unknown): v is ImageResolution {
	return isObject(v) && 'url' in v && 'widthṔx' in v && 'heightPx' in v;
}
