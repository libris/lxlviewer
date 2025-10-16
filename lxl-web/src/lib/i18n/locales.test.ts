import { describe, it, expect } from 'vitest';
import { initLocalizeHref } from './locales';

describe('initLocalizeHref', () => {
	it('hrefs are localized', () => {
		const localizeHref = initLocalizeHref('en', 'https://libris.kb.se');
		expect(localizeHref('/')).toEqual('/en');
		expect(localizeHref('/#top')).toEqual('/en#top');
		expect(localizeHref('/?test')).toEqual('/en?test');
		expect(localizeHref('/test?hello=world#top')).toEqual('/en/test?hello=world#top');
	});
	it('hrefs are unchanged if target locale is same as current locale', () => {
		const localizeHref = initLocalizeHref('en', 'https://libris.kb.se');
		expect(localizeHref('/en/test?hello=world#top')).toEqual('/en/test?hello=world#top');
	});
	it('base locales are omitted', () => {
		const localizeHref = initLocalizeHref('sv', 'https://libris.kb.se');
		expect(localizeHref('/en/test?hello=world#top')).toEqual('/test?hello=world#top');
		expect(localizeHref('/sv/test?hello=world#top')).toEqual('/test?hello=world#top');
		expect(localizeHref('/test?hello=world#top')).toEqual('/test?hello=world#top');
		expect(localizeHref('/sv')).toEqual('/');
	});
	it('target locale can be overridden using the options.locale param', () => {
		const localizeHref = initLocalizeHref('en', 'https://libris.kb.se');
		expect(localizeHref('/test?hello=world#top', { locale: 'sv' })).toEqual(
			'/test?hello=world#top'
		);
		expect(localizeHref('/en#top', { locale: 'sv' })).toEqual('/#top');
		expect(localizeHref('/en?test', { locale: 'sv' })).toEqual('/?test');
	});
	it('absolute URLs are kept as-is', () => {
		const localizeHref = initLocalizeHref('sv', 'https://libris.kb.se');
		expect(localizeHref('https://www.wikipedia.org/', { locale: 'sv' })).toEqual(
			'https://www.wikipedia.org/'
		);
		expect(localizeHref('https://www.wikipedia.org/', { locale: 'en' })).toEqual(
			'https://www.wikipedia.org/'
		);
	});
});
