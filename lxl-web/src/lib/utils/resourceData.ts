import {
	Fmt,
	JsonLd,
	type DisplayDecorated,
	type HtmlNode,
	type PropertyNode,
	type ResourceNode
} from '$lib/types/xl';

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

// --- additions

export function isPropertyNode(data: DisplayDecorated): data is PropertyNode {
	return typeof data === 'object' && !Array.isArray(data) && Fmt.PROP in data;
}

export function isResourceNode(data: DisplayDecorated): data is ResourceNode {
	return typeof data === 'object' && !Array.isArray(data) && !isPropertyNode(data);
}

export function isHtmlNode(data: DisplayDecorated): data is HtmlNode {
	return typeof data === 'object' && !Array.isArray(data) && Fmt.HTML in data;
}

/**
 * Find all properties with the given name anywhere in the data.
 */
export function getProperties(data: DisplayDecorated, prop: string): PropertyNode[] {
	if (typeof data === 'string' || isHtmlNode(data)) {
		return [];
	}

	if (Array.isArray(data)) {
		return data.flatMap((item) => getProperties(item, prop));
	}

	if (isPropertyNode(data)) {
		const properties = data[Fmt.PROP] === prop ? [data] : [];

		return [...properties, ...getProperties(data[Fmt.VALUE], prop)];
	}

	return data[Fmt.DISPLAY].flatMap((item) => getProperties(item, prop));
}

/**
 * Get the immediate values of all properties with the given name.
 */
export function getPropertyValues(data: DisplayDecorated, prop: string): DisplayDecorated[] {
	return getProperties(data, prop).flatMap((property) => {
		const value = property[Fmt.VALUE];

		return Array.isArray(value) ? value : [value];
	});
}
