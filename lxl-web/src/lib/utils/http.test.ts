import { describe, it, expect } from 'vitest';
import { relativizeUrl } from './http';

describe('relativize', () => {
	it('formats an absolute URL to a relative path', () => {
		expect(relativizeUrl('https://libris.kb.se/grz79wcldbmgz6jr')).toStrictEqual(
			'/grz79wcldbmgz6jr'
		);
	});
});
