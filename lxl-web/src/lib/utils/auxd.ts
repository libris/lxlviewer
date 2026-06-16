import { Width } from '$lib/types/auxd';
import type { Image, ImageResolution } from '$lib/types/auxd';

export function bestSize(from: Image, minWidthPx: number): ImageResolution;
export function bestSize(from: undefined, minWidthPx: number): undefined;
export function bestSize(from: Image | undefined, minWidthPx: number): ImageResolution | undefined {
	if (from === undefined) {
		return undefined;
	}
	const sizes = from.sizes;
	const result = sizes.find((i) => i.widthPx >= minWidthPx);
	// REMOVE ME - TEMP SEARCH & REPLACE IN IMG URL
	if (result) return result;

	const fallbackSize = sizes[sizes.length - 1];
	if (fallbackSize) {
		if (minWidthPx === Width.SMALL) {
			const _thumbUrl = fallbackSize.url.replace('.full.', `.${minWidthPx}.`);
			fallbackSize.url = _thumbUrl;
		}
		return fallbackSize;
	}

	return undefined;
	// return result || sizes[sizes.length - 1];
}
