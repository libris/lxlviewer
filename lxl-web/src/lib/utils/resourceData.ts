import {
	Fmt,
	JsonLd,
	type DisplayDecorated,
	type HtmlNode,
	type PropertyNode,
	type ResourceNode
} from '$lib/types/xl';

function _getPropertyValue(data: DisplayDecorated, name: string) {
	if (data && typeof data === 'object' && !Array.isArray(data) && name in data) {
		return data[name];
	}
	return undefined;
}

export function getStyle(data: DisplayDecorated): string[] | undefined {
	const style = _getPropertyValue(data, Fmt.STYLE);
	if (style) {
		return style as string[];
	}

	return undefined;
}

export function hasStyle(data: DisplayDecorated, styleName: string) {
	return getStyle(data)?.includes(styleName);
}

export function getResourceId(data: DisplayDecorated) {
	const id = _getPropertyValue(data, JsonLd.ID);
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

export function isPropertyNode(data: DisplayDecorated): data is PropertyNode {
	return typeof data === 'object' && !Array.isArray(data) && Fmt.PROP in data;
}

export function isResourceNode(data: DisplayDecorated): data is ResourceNode {
	return (
		typeof data === 'object' && !Array.isArray(data) && !isPropertyNode(data) && !isHtmlNode(data)
	);
}

export function isHtmlNode(data: DisplayDecorated): data is HtmlNode {
	return typeof data === 'object' && !Array.isArray(data) && Fmt.HTML in data;
}

export function getProperties(data: DisplayDecorated, prop: string): PropertyNode[] {
	if (typeof data === 'string' || isHtmlNode(data)) {
		return [];
	}

	if (Array.isArray(data)) {
		return data?.flatMap((item) => getProperties(item, prop));
	}

	if (isPropertyNode(data)) {
		return data[Fmt.PROP] === prop ? [data] : [];
	}

	return data[Fmt.DISPLAY]?.filter((property) => property[Fmt.PROP] === prop);
}

export function getPropertyValues(data: DisplayDecorated, prop: string): DisplayDecorated[] {
	return getProperties(data, prop)?.flatMap((property) => {
		const value = property[Fmt.VALUE];

		return Array.isArray(value) ? value : [value];
	});
}

export function getStringPropertyValues(data: DisplayDecorated, prop: string): string[] {
	return getPropertyValues(data, prop).filter(
		(value): value is string => typeof value === 'string'
	);
}
