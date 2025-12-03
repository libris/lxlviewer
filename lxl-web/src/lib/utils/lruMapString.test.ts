import { describe, it, expect } from 'vitest';
import { buildMapper, hashingLruMap, map } from '$lib/utils/lruMapString';

describe('lruMap', () => {
	const KEY_LENGTH = 10;
	const VALUE_LENGTH = 2;
	const MAX_NUM_ENTRIES = 100;

	const [get, put, remove] = buildMapper(KEY_LENGTH, VALUE_LENGTH, MAX_NUM_ENTRIES);

	let k = 0;
	let v = 0;
	const exampleKey = () => `k${k++}`.padEnd(KEY_LENGTH, 'k');
	const exampleValue = () => `${v++}`.padEnd(VALUE_LENGTH, 'v');

	it('returns the same value', () => {
		const k = exampleKey();
		const v = exampleValue();
		let data = '';
		data = put(data, k, v);
		expect(get(data, k)).toBe(v);
	});
	it('returns null for unknown keys', () => {
		const k = exampleKey();
		const data = '';
		expect(get(data, k)).toBe(null);
	});
	it('overwrites value', () => {
		const k = exampleKey();
		const v = exampleValue();
		const v2 = exampleValue();
		let data = '';
		data = put(data, k, v);
		expect(get(data, k)).toBe(v);
		data = put(data, k, v2);
		expect(get(data, k)).toBe(v2);
	});
	it('removes value', () => {
		const k = exampleKey();
		const v = exampleValue();
		let data = '';

		data = put(data, k, v);
		expect(get(data, k)).toBe(v);
		data = remove(data, k);
		expect(get(data, k)).toBe(null);
	});
});

describe('hashingLruMap', () => {
	const VALUE_LENGTH = 2;
	const MAX_NUM_ENTRIES = 100;

	const [get, put, remove] = hashingLruMap(VALUE_LENGTH, MAX_NUM_ENTRIES);

	let k = 0;
	let v = 0;
	const exampleKey = () => `k${k++}`.padEnd(50, 'k');
	const exampleValue = () => `${v++}`.padEnd(VALUE_LENGTH, 'v').slice(0, VALUE_LENGTH);

	it('returns the same value', () => {
		const k = exampleKey();
		const v = exampleValue();
		let data = '';
		data = put(data, k, v);
		expect(get(data, k)).toBe(v);
	});
	it('returns the same value many', () => {
		const k1 = exampleKey();
		const v1 = exampleValue();
		const k2 = exampleKey();
		const v2 = exampleValue();
		const k3 = exampleKey();
		const v3 = exampleValue();
		let data = '';
		data = put(data, k1, v1);
		data = put(data, k2, v2);
		data = put(data, k3, v3);
		expect(get(data, k1)).toBe(v1);
		expect(get(data, k2)).toBe(v2);
		expect(get(data, k3)).toBe(v3);
	});
	it('keeps the most recently added', () => {
		const keys = [];
		const values = [];
		const NUM_OVERFLOW = MAX_NUM_ENTRIES / 2;

		let data = '';

		for (let i = 0; i < MAX_NUM_ENTRIES + NUM_OVERFLOW; i++) {
			keys.push(exampleKey());
			values.push(exampleValue());

			data = put(data, keys[i], values[i]);
		}

		for (let i = 0; i < MAX_NUM_ENTRIES + NUM_OVERFLOW; i++) {
			if (i < NUM_OVERFLOW) {
				expect(get(data, keys[i])).toBe(null);
			} else {
				expect(get(data, keys[i])).toBe(values[i]);
			}
		}

		console.log(data);
	});
	it('returns null for unknown keys', () => {
		const k = 'k';
		const data = '';
		expect(get(data, k)).toBe(null);
	});
	it('overwrites value', () => {
		const k = 'key';
		const v = exampleValue();
		const v2 = exampleValue();
		let data = '';
		data = put(data, k, v);
		expect(get(data, k)).toBe(v);
		data = put(data, k, v2);
		expect(get(data, k)).toBe(v2);
	});
	it('removes value', () => {
		const k = 'k';
		const v = 'v'.repeat(VALUE_LENGTH);
		let data = '';

		data = put(data, k, v);
		expect(get(data, k)).toBe(v);
		data = remove(data, k);
		expect(get(data, k)).toBe(null);
	});

	it('functions', () => {
		enum Color {
			Red = 1,
			Green = 2,
			Blue = 3
		}

		const m = map(Color, 10);
		let data = '';

		data = m.put(data, 'R', Color.Red);
		data = m.put(data, 'G', Color.Green);
		data = m.put(data, 'B', Color.Blue);

		console.log(data);

		console.log(m.get(data, 'R'));
		console.log(m.get(data, 'G'));
		console.log(m.get(data, 'B'));
	});
});
