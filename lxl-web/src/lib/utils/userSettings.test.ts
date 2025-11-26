import { describe, it, expect } from 'vitest';
import { UserSettings } from './userSettings.svelte';

const s = {
	myLibraries: {
		'1234': {
			'@id': '1234',
			label: 'Kungliga bibiblioteket',
			sigel: 'S'
		},
		'6456456': {
			'@id': '6456456',
			label: 'Göteborg',
			sigel: 'Gbg'
		}
	},
	facetSort: {
		'rdf:type': 'hits.asc',
		hasInstanceType: 'alpha.asc'
	}
};
const anotherLib = { '@id': '434566', label: 'Nya biblioteket', sigel: 'N' };
const userSettings = new UserSettings(s);

describe('userSettings util', () => {
	it('returns the user fav libraries', () => {
		expect(userSettings.myLibraries).toBe(s.myLibraries);
	});

	it('returns the user facet sort', () => {
		expect(userSettings.facetSort).toBe(s.facetSort);
	});

	it('can add a library', () => {
		userSettings.addLibrary(anotherLib);
		expect(userSettings.myLibraries).toStrictEqual({
			'1234': {
				'@id': '1234',
				label: 'Kungliga bibiblioteket',
				sigel: 'S'
			},
			'434566': {
				'@id': '434566',
				label: 'Nya biblioteket',
				sigel: 'N'
			},
			'6456456': {
				'@id': '6456456',
				label: 'Göteborg',
				sigel: 'Gbg'
			}
		});
	});

	it('can remove a library', () => {
		userSettings.removeLibrary('1234');
		userSettings.removeLibrary('434566');
		expect(userSettings.myLibraries).toStrictEqual({
			'6456456': {
				'@id': '6456456',
				label: 'Göteborg',
				sigel: 'Gbg'
			}
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
