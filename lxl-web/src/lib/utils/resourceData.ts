import type { ResourceData } from '$lib/types/resourceData';

export function getPropertyValue(data: ResourceData, name: string) {
	if (data && typeof data === 'object' && !Array.isArray(data) && name in data) {
		return data[name];
	}
	return undefined;
}

export function getStyle(data: ResourceData) {
	const style = getPropertyValue(data, '_style');
	if (style) {
		return style as string[];
	}

	return undefined;
}

export function hasStyle(data: ResourceData, styleName: string) {
	return getStyle(data)?.includes(styleName);
}

export function getResourceId(data: ResourceData) {
	const id = getPropertyValue(data, '@id');
	if (typeof id === 'string' && id.length) {
		return id;
	}
	return undefined;
}

export function getFilteredEntries(data: Record<string, ResourceData>, hiddenProperties: string[]) {
	return Object.entries(data).filter(([key]) => !hiddenProperties.includes(key));
}
