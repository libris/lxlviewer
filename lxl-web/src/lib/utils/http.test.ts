import { describe, it, expect } from 'vitest';
import { getBaseUrl, relativizeUrl, stripAnchor, trimSlashes } from './http';

describe('relativize', () => {
	it('formats an absolute URL to a relative path', () => {
		expect(relativizeUrl('https://libris.kb.se/grz79wcldbmgz6jr')).toStrictEqual(
			'/grz79wcldbmgz6jr'
		);
	});
});

describe('getBase', () => {
	it('returns base', () => {
		expect(getBaseUrl('https://example.com')).toStrictEqual('https://example.com');
		expect(getBaseUrl('https://example.com/')).toStrictEqual('https://example.com');
		expect(getBaseUrl('https://example.com/abc')).toStrictEqual('https://example.com');
		expect(getBaseUrl('https://example.com/abc/123')).toStrictEqual('https://example.com');
		expect(getBaseUrl('https://example.com/abc/123/')).toStrictEqual('https://example.com');
		expect(getBaseUrl('https://xyz.example.com:8888/abc/123/')).toStrictEqual(
			'https://xyz.example.com:8888'
		);
		expect(getBaseUrl('https://a')).toStrictEqual('https://a');
		expect(getBaseUrl('ftp://example.com/abc')).toStrictEqual('ftp://example.com');
	});
	it('handles bad values', () => {
		expect(getBaseUrl(undefined)).toStrictEqual(undefined);
		expect(getBaseUrl(null)).toStrictEqual(undefined);
		expect(getBaseUrl('')).toStrictEqual(undefined);
		expect(getBaseUrl('https://')).toStrictEqual(undefined);
		expect(getBaseUrl('https:/')).toStrictEqual(undefined);
		expect(getBaseUrl('example.com')).toStrictEqual(undefined);
		expect(getBaseUrl('https:/example.com')).toStrictEqual(undefined);
	});
});

describe('stripAnchor', () => {
	it('strips anchors', () => {
		expect(stripAnchor('hello#world')).toStrictEqual('hello');
	});
});

describe('trimSlashes', () => {
	it('trims leading slashes', () => {
		expect(trimSlashes('/hello')).toStrictEqual('hello');
	});
	it('trims trailing slashes', () => {
		expect(trimSlashes('hello/')).toStrictEqual('hello');
	});
	it('keeps slashes in-between', () => {
		expect(trimSlashes('/hello/world/')).toStrictEqual('hello/world');
	});
});
