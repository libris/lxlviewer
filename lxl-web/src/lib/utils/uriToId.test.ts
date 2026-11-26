import { describe, expect, it } from 'vitest';
import { uriToId } from './xl.server';

describe('uriToId', () => {
	it('moves uri to @id and drops separator from the new first property', () => {
		const data = {
			'@type': 'Document',
			_display: [
				{ _prop: 'uri', _value: 'https://example.org/a' },
				{ _contentBefore: ' · ', _prop: 'label', _value: 'Artikel' }
			]
		};
		expect(uriToId(data)).toStrictEqual({
			'@type': 'Document',
			'@id': 'https://example.org/a',
			_display: [{ _prop: 'label', _value: 'Artikel' }]
		});
	});

	it('keeps separators when uri is not the first property', () => {
		const data = {
			'@type': 'Document',
			_display: [
				{ _prop: 'label', _value: 'Artikel' },
				{ _contentBefore: ' · ', _prop: 'uri', _value: 'https://example.org/a' },
				{ _contentBefore: ' · ', _prop: 'marc:publicNote', _value: 'Fritt tillgänglig' }
			]
		};
		expect(uriToId(data)).toStrictEqual({
			'@type': 'Document',
			'@id': 'https://example.org/a',
			_display: [
				{ _prop: 'label', _value: 'Artikel' },
				{ _contentBefore: ' · ', _prop: 'marc:publicNote', _value: 'Fritt tillgänglig' }
			]
		});
	});

	it('keeps uri in _display when there is nothing else to use as link label', () => {
		const data = {
			'@type': 'Document',
			_display: [{ _prop: 'uri', _value: 'https://example.org/a' }]
		};
		expect(uriToId(data)).toStrictEqual({
			'@type': 'Document',
			'@id': 'https://example.org/a',
			_display: [{ _prop: 'uri', _value: 'https://example.org/a' }]
		});
	});
});
