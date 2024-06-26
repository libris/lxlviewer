import { JsonLd, Owl, type Link } from './xl';

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
