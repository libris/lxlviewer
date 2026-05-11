import { Fmt, JsonLd, type DisplayDecorated } from '$lib/types/xl';

type Data = Record<string, unknown>;
const FMT_VALUES = Object.values(Fmt);

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
		v.push(
			...Object.entries(data)
				.filter(([k]) => !(FMT_VALUES.includes(k) || [JsonLd.TYPE, JsonLd.ID].includes(k)))
				.map(([, v]) => toString(v))
		);
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
