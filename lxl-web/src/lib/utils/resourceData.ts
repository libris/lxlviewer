import type { ResourceData } from '$lib/types/ResourceData';

export function getResourceProperty(value: ResourceData, name: string) {
	if (value && typeof value === 'object' && !Array.isArray(value) && name in value) {
		return value[name];
	}
	return undefined;
}

export function getResourcePropertyStyle(value: ResourceData) {
	const style = getResourceProperty(value, '_style');
	if (style) {
		return style as string[];
	}

	return undefined;
}

export function getResourceId(value: ResourceData) {
	const id = getResourceProperty(value, '@id');
	if (typeof id === 'string' && id.length) {
		return id;
	}
	return undefined;
}
