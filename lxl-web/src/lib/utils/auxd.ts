import type { Image, ImageResolution } from '$lib/types/auxd';

export function bestSize(from: Image, minWidthPx: number): ImageResolution;
export function bestSize(from: undefined, minWidthPx: number): undefined;
export function bestSize(from: Image | undefined, minWidthPx: number): ImageResolution | undefined {
	if (from === undefined) {
		return undefined;
	}
	const sizes = from.sizes;
	const result = sizes.find((i) => i.widthPx >= minWidthPx);
	return result || sizes[sizes.length - 1];
}
