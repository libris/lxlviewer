import { JsonLd, type DisplayDecorated } from '$lib/types/xl';

export function getPropertyValue(data: DisplayDecorated, name: string) {
	if (data && typeof data === 'object' && !Array.isArray(data) && name in data) {
		return data[name];
	}
	return undefined;
}

export function getStyle(data: DisplayDecorated): string[] | undefined {
	const style = getPropertyValue(data, '_style');
	if (style) {
		return style as string[];
	}

	return undefined;
}

export function hasStyle(data: DisplayDecorated, styleName: string) {
	return getStyle(data)?.includes(styleName);
}

export function getResourceId(data: DisplayDecorated) {
	const id = getPropertyValue(data, JsonLd.ID);
	if (typeof id === 'string' && id.length) {
		return id;
	}
	return undefined;
}

export function getFilteredEntries(
	data: Record<string, DisplayDecorated>,
	hiddenProperties: string[]
) {
	return Object.entries(data).filter(([key]) => !hiddenProperties.includes(key));
}
