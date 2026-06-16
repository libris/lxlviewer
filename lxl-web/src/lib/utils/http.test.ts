import { describe, it, expect } from 'vitest';
import { relativizeUrl, stripAnchor, trimSlashes } from './http';

describe('relativize', () => {
	it('formats an absolute URL to a relative path', () => {
		expect(relativizeUrl('https://libris.kb.se/grz79wcldbmgz6jr')).toStrictEqual(
			'/grz79wcldbmgz6jr'
		);
	});
});

describe('stripAnchor', () => {
	it('strips anchors', () => {
		expect(stripAnchor('hello#world'), 'hello');
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
