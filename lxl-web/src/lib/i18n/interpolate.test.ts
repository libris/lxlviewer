import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolate';

describe('iterpolate', () => {
	it('replaces placeholders with corresponding values', () => {
		const template = 'Hi {name}, welcome to {site}!';
		const values = { name: 'Kalle', site: 'Libris' };
		expect(interpolate(template, values)).toEqual('Hi Kalle, welcome to Libris!');
	});
});
