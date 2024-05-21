/** @type {typeof import('./sv.js').default} */
export default {
	home: {
		searchPlaceholder: 'Title, author, subject et cetera'
	},
	header: {
		help: 'Help',
		changeLang: 'På svenska',
		searchPlaceholder: 'Title, author, subject et cetera',
		openMenu: 'Open main menu'
	},
	footer: {
		logo: 'National Library of Sweden logotype',
		information: 'Information',
		faq: 'FAQ about this beta',
		contact: 'Contact',
		feedback: 'Give feedback',
		feedbackLink: 'http://survey.kb.se/librisbeta/en',
		customerSupport: 'Libris customer support'
	},
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
		'rdf:type': 'Type',
		workType: 'Type',
		instanceType: 'Carrier type',
		genreForm: 'Genre/form',
		itemHeldBy: 'Library',
		bibliography: 'Bibliography',
		contributor: 'Contribution',
		language: 'Language',
		subject: 'Subject',
		yearPublished: 'Year published',
		intendedAudience: 'Intended audience'
	},
	search: {
		search: 'Search',
		loading: 'Loading...',
		findFilter: 'Find filter',
		filters: 'Filters',
		activeFilters: 'Active filters',
		selectedFilters: 'Selected filters',
		clearFilters: 'Clear',
		editFilters: 'Edit',
		noResults: 'No results',
		hits: 'hits',
		hitsOne: 'hit',
		selected: 'selected',
		selectedOne: 'selected',
		editions: 'editions',
		publicationYear: 'Publication year',
		publisher: 'Publisher',
		type: 'Type',
		related: 'related',
		relatedOne: 'related',
		previous: 'Previous page',
		page: 'Page',
		next: 'Next page',
		showMore: 'Show more',
		showFewer: 'Show fewer',
		showDetails: 'Show more',
		hideDetails: 'Show less'
	},
	sort: {
		sortBy: 'Sort by',
		relevancy: 'Relevancy',
		alphaAsc: 'A-Z',
		alphaDesc: 'Z-A',
		publicationAsc: 'Publication year (oldest first)',
		publicationDesc: 'Publication year (newest first)',
		linksDesc: 'Most linked'
	},
	errors: {
		somethingWentWrong: 'Something went wrong',
		notFound: 'Page not found',
		wrongLink: "Did you click on a link that didn't work?",
		sendEmail: 'Send an e-mail to',
		customerService: 'Libris customer service',
		followUp: ', and we will investigate the error.',
		backToStartPage: 'Back to the home page',
		mailSubject: 'Incorrect link',
		mailBody: 'Incorrect reference to the page'
	},
	general: {
		collapseAll: 'Collapse all',
		copyPermalinkToInstance: 'Copy link to edition',
		latestInstanceCover: 'Cover of latest edition',
		instanceCover: 'Cover of edition',
		close: 'Close',
		apply: 'Apply',
		from: 'From',
		to: 'To',
		year: 'Year'
	},
	holdings: {
		availableAt: 'Available at',
		library: 'library',
		libraries: 'libraries',
		findAtYourNearestLibrary: 'Find it at your nearest library'
	}
};
