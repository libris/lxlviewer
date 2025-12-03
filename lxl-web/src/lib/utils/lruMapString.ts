export type LruMap = string;
export type GetFn<T> = (data: LruMap, key: string) => T | null;
export type PutFn<T> = (data: LruMap, key: string, value: T) => LruMap;
export type RemoveFn = (data: LruMap, key: string) => LruMap;

const BASE_64_53_BITS_LEN = 10;

export function hashingLruMap(
	valueLength: number,
	maxNumEntries: number
): [GetFn<string>, PutFn<string>, RemoveFn] {
	return buildWithEncoder(
		(key) => _53BitIntegerToBase64(cyrb53(key)),
		BASE_64_53_BITS_LEN,
		valueLength,
		maxNumEntries
	);
}

function buildWithEncoder(
	keyEncoder: (key: string) => string,
	keyLength: number,
	valueLength: number,
	maxNumEntries: number
): [GetFn<string>, PutFn<string>, RemoveFn] {
	const [get, put, remove] = buildMapper(keyLength, valueLength, maxNumEntries);

	return [
		(data, key) => get(data, keyEncoder(key)),
		(data, key, value) => put(data, keyEncoder(key), value),
		(data, key) => remove(data, keyEncoder(key))
	];
}

export function buildMapper(
	keyLength: number,
	valueLength: number,
	maxNumEntries: number
): [GetFn<string>, PutFn<string>, RemoveFn] {
	const maxDataSize = maxNumEntries * (keyLength + valueLength);

	function get(data: string, key: string): string | null {
		checkData(data);
		checkKey(key);

		for (let i = 0; i < data.length; i += keyLength + valueLength) {
			if (data.slice(i, i + keyLength) === key) {
				return data.slice(i + keyLength, i + keyLength + valueLength);
			}
		}

		return null;
	}

	function put(data: string, key: string, value: string): string {
		checkData(data);
		checkKey(key);
		checkValue(value);

		data = remove(data, key);
		data = key + value + data;

		if (data.length > maxDataSize) {
			data = data.slice(0, maxDataSize);
		}

		return data;
	}

	function remove(data: string, key: string): string {
		checkData(data);
		checkKey(key);

		for (let i = 0; i < data.length; i += keyLength + valueLength) {
			if (data.slice(i, i + keyLength) === key) {
				data = data.slice(0, i) + data.slice(i + keyLength + valueLength);
				return data;
			}
		}

		return data;
	}

	function checkKey(key: string) {
		if (key.length != keyLength) {
			throw new Error('key length must be ' + keyLength);
		}
	}

	function checkValue(value: string) {
		if (value.length != valueLength) {
			throw new Error('value length must be ' + valueLength);
		}
	}

	function checkData(data: string) {
		if (data.length % (keyLength + valueLength) !== 0) {
			throw new Error(`corrupt data, length must be a multiple of ${keyLength} + ${valueLength}`);
		}
	}

	return [get, put, remove];
}

/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    License: Public domain (or MIT if needed). Attribution appreciated.
    A fast and simple 53-bit string hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
*/
const cyrb53 = function (str: string, seed = 0): number {
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function _53BitIntegerToBase64(num: number): string {
	if (!Number.isSafeInteger(num)) {
		throw new Error('Must be ');
	}

	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	view.setBigUint64(0, BigInt(num), false);

	let binary = '';
	const bytes = new Uint8Array(buffer);
	const skipBytes = 1; // first byte is always 0
	for (let i = skipBytes; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	// we know that the value always fits exactly in 10 characters
	// last two characters are always filler '=='
	return btoa(binary).slice(0, -2);
}

/*
function _base64To53BitInteger(base64 : string) : number {
	if (base64.length != 10) {
		throw new Error("must be a string of length 10");
	}

	const binary = atob(base64);

	const bytes = new Uint8Array(8);
	for (let i = 0; i < binary.length; i++) {
		bytes[i+1] = binary.charCodeAt(i);
	}

	const view = new DataView(bytes.buffer);
	const num = view.getBigUint64(0, false);

	return Number(num);
}
 */

export type EnumLike = { [key: string]: string | number };

export function createEnumCoder<T extends EnumLike>(enumType: T) {
	return {
		encode(value: T[keyof T]): string {
			return `${value as number}`;
		},
		decode(num: string | null): T[keyof T] | null {
			if (num == null) {
				return null;
			}
			return enumType[Number.parseInt(num) as keyof T];
		}
	};
}

export function map<T extends EnumLike>(
	enumType: T,
	maxNumEntries: number
): { get: GetFn<T[keyof T]>; put: PutFn<T[keyof T]>; remove: RemoveFn } {
	const coder = createEnumCoder(enumType);
	const [get, put, remove] = hashingLruMap(1, maxNumEntries);

	return {
		get: (data, key) => coder.decode(get(data, key)),
		put: (data, key, value) => put(data, key, coder.encode(value)),
		remove: (data, key) => remove(data, key)
	};
}
