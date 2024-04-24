/** @type {typeof import('./sv.js').default} */
export default {
	home: {},
	facet: {
		q: 'Free text search',
		'@reverse.itemOf.heldBy.@id': 'Has holding',
		'instanceOf.@type': 'Type of work',
		issuanceType: 'Issuance type',
		'publication.year': 'Publication year',
		'instanceOf.language.@id': 'Language of work',
		'@type': 'Type',
		'inScheme.@id': 'Term System',
		'inCollection.@id': 'Term Collection',
		'nationality.@id': 'Nationality',
		'language.@id': 'Language',
		'genreForm.@id': 'Genre/form',
		'instanceOf.genreForm.@id': 'Genre/form of work',
		'contribution.agent.@id': 'Contribution or primary contribution',
		'contentType.@id': 'Content type',
		'carrierType.@id': 'Carrier type',
		'instanceOf.subject.@id': 'Subject',
		'subject.@id': 'Subject',
		'intendedAudience.@id': 'Intended audience',
		'meta.bibliography.@id': 'In bibliography',
		'category.@id': 'Change category',
		'concerning.@reverse.itemOf.heldBy.@id': 'Has holding',
		'concerning.issuanceType': 'Issuance type',
		'@reverse': 'Relation',
		'meta.encodingLevel': 'Encoding level',
		genreForm: 'Genre/form',
		itemHeldBy: 'Library',
		contributor: 'Contribution',
		language: 'Language',
		subject: 'Subject',
		yearPublished: 'Year published',
		intendedAudience: 'Intended audience'
	},
	search: {
		findFilter: 'Find filter'
  },
	sort: {
		relevancy: 'Relevancy',
		alphaAsc: 'A-Z',
		alphaDesc: 'Z-A',
		publicationAsc: 'Publication year (oldest first)',
		publicationDesc: 'Publication year (newest first)',
		linksDesc: 'Most linked'
	},
	errors: {},
	general: {
		collapseAll: 'Collapse all',
		copyPermalinkToInstance: 'Copy link to edition',
		latestInstanceCover: 'Cover of latest edition',
		instanceCover: 'Cover of edition',
		close: 'Close'
	},
	holdings: {
		availableAt: 'Available at',
		library: 'library',
		libraries: 'libraries',
		findAtYourNearestLibrary: 'Find it at your nearest library'
	}
};
