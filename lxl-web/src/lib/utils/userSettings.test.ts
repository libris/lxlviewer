import { describe, it, expect } from 'vitest';
import { UserSettings } from './userSettings.svelte';

const s = {
	myLibraries: {
		'https://libris.kb.se/library/Nodi': 'Ale bibliotek',
		'https://libris.kb.se/library/org/BIN': 'Biblioteken i Norrbotten'
	},
	facetSort: {
		'rdf:type': 'hits.asc',
		hasInstanceType: 'alpha.asc'
	}
};
const userSettings = new UserSettings(s);

describe('userSettings util', () => {
	it('returns the user fav libraries', () => {
		expect(userSettings.myLibraries).toBe(s.myLibraries);
	});

	it('returns the user facet sort', () => {
		expect(userSettings.facetSort).toBe(s.facetSort);
	});

	it('can add a library', () => {
		userSettings.addLibrary('https://libris.kb.se/library/Bole', 'Bollebygds bibliotek');
		expect(userSettings.myLibraries).toStrictEqual({
			'https://libris.kb.se/library/Bole': 'Bollebygds bibliotek',
			'https://libris.kb.se/library/Nodi': 'Ale bibliotek',
			'https://libris.kb.se/library/org/BIN': 'Biblioteken i Norrbotten'
		});
	});

	it('can remove a library', () => {
		userSettings.removeLibrary('https://libris.kb.se/library/Bole');
		userSettings.removeLibrary('https://libris.kb.se/library/Nodi');
		expect(userSettings.myLibraries).toStrictEqual({
			'https://libris.kb.se/library/org/BIN': 'Biblioteken i Norrbotten'
		});
	});

	it('can save a facet sort', () => {
		userSettings.saveFacetSort('language', 'alpha.desc');
		expect(userSettings.facetSort).toEqual({
			hasInstanceType: 'alpha.asc',
			'rdf:type': 'hits.asc',
			language: 'alpha.desc'
		});
	});

	it('can save the leading pane width', () => {
		userSettings.setLeadingPaneWidth(245);
		expect(userSettings.leadingPane?.width).toEqual(245);
	});

	it('can save closing and opening the leading pane', () => {
		userSettings.closeLeadingPane();
		expect(userSettings.leadingPane?.open).toEqual(false);
		userSettings.openLeadingPane();
		expect(userSettings.leadingPane?.open).toEqual(true);
	});

	it('can save the trailing pane width', () => {
		userSettings.setTrailingPaneWidth(248);
		expect(userSettings.trailingPane?.width).toEqual(248);
	});
});
