const LXLJS_SETTINGS = {
	language: 'sv',
	version: process.env.APP_VERSION,
	gitDescribe: process.env.GIT_DESCRIBE,
	filteredCategories: ['pending', 'shorthand', 'unstable'],
	propertyChains: {
		'@reverse.itemOf.heldBy.@id': {
			sv: 'Har bestånd',
			en: 'Has holding',
			facet: {
				order: -1
			}
		},
		'instanceOf.@type': {
			sv: 'Verkstyp',
			en: 'Type of work',
			facet: {
				order: 0
			}
		},
		issuanceType: {
			sv: 'Utgivningssätt',
			en: 'Issuance type',
			facet: {
				order: 1
			}
		},
		'meta.encodingLevel': {
			sv: 'Beskrivningsnivå',
			en: 'Encoding level',
			facet: {
				order: 2
			}
		},
		'publication.year': {
			sv: 'Utgivningsår',
			en: 'Publication year',
			facet: {
				order: 3
			}
		},
		'instanceOf.language.@id': {
			sv: 'Verksspråk',
			en: 'Language of work',
			facet: {
				order: 4
			}
		},
		'@type': {
			sv: 'Typ',
			en: 'Type',
			facet: {
				order: 5
			}
		},
		'inScheme.@id': {
			sv: 'Termsystem',
			en: 'Term System',
			facet: {
				order: 6
			}
		},
		'inCollection.@id': {
			sv: 'Termsamling',
			en: 'Term Collection',
			facet: {
				order: 7
			}
		},
		'nationality.@id': {
			sv: 'Nationalitet',
			en: 'Nationality',
			facet: {
				order: 8
			}
		},
		'language.@id': {
			sv: 'Språk',
			en: 'Language',
			facet: {
				order: 9
			}
		},
		'genreForm.@id': {
			sv: 'Genre/form',
			en: 'Genre/form',
			facet: {
				order: 10
			}
		},
		'instanceOf.genreForm.@id': {
			sv: 'Genre/form på verket',
			en: 'Genre/form of work',
			facet: {
				order: 11
			}
		},
		'contribution.agent.@id': {
			sv: 'Medverkan eller primär medverkan',
			en: 'Contribution or primary contribution',
			facet: {
				order: 12
			}
		},
		'contentType.@id': {
			sv: 'Innehållstyp',
			en: 'Content type',
			facet: {
				order: 13
			}
		},
		'carrierType.@id': {
			sv: 'Bärartyp',
			en: 'Carrier type',
			facet: {
				order: 14
			}
		},
		'instanceOf.subject.@id': {
			sv: 'Ämne',
			en: 'Subject',
			facet: {
				order: 15
			}
		},
		'meta.bibliography.@id': {
			sv: 'Ingår i bibliografi',
			en: 'In bibliography',
			facet: {
				order: 16
			}
		},
		'@reverse': {
			sv: 'Relation',
			en: 'Relation',
			facet: {
				order: 0
			}
		}
	}
};

export default LXLJS_SETTINGS;
