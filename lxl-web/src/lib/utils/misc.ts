import { Fmt, JsonLd, type DisplayDecorated } from '$lib/types/xl';

type Data = Record<string, unknown>;

// TODO
export function toString(data: DisplayDecorated): string {
	if (isObject(data)) {
		const v = [];
		if (Fmt.CONTENT_BEFORE in data && data[Fmt.CONTENT_BEFORE] !== '') {
			v.push(data[Fmt.CONTENT_BEFORE]);
		}
		if (Fmt.DISPLAY in data) {
			v.push(...data[Fmt.DISPLAY].map(toString));
		}
		if (Fmt.VALUE in data) {
			if (Array.isArray(data[Fmt.VALUE])) {
				v.push(...data[Fmt.VALUE].map(toString));
			} else {
				v.push(toString(data[Fmt.VALUE]));
			}
		}
		if (JsonLd.VALUE in data && typeof data[JsonLd.VALUE] === 'string') {
			v.push(data[JsonLd.VALUE]);
		}
		if (Fmt.CONTENT_AFTER in data && data[Fmt.CONTENT_AFTER] !== '') {
			v.push(data[Fmt.CONTENT_AFTER]);
		}
		return v.join('');
	} else if (Array.isArray(data)) {
		return data.map(toString).join('');
	} else {
		return data;
	}
}

export function isObject(data: unknown): data is Data {
	return typeof data === 'object' && !Array.isArray(data) && data !== null;
}

export function asArray<V>(v: V | Array<V>): Array<V> | [] {
	return Array.isArray(v) ? v : v === null || v === undefined ? [] : [v];
}
