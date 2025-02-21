/** @type {typeof import('./sv.js').default} */
export default {
	home: {
		searchPlaceholder: 'Title, author, subject etc'
	},
	header: {
		help: 'Help',
		changeLang: 'På svenska',
		searchPlaceholder: 'Title, author, subject etc.',
		openMenu: 'Open main menu'
	},
	footer: {
		logo: 'National Library of Sweden logotype',
		information: 'Information',
		faq: 'FAQ about this beta',
		contact: 'Contact',
		feedback: 'Give feedback',
		feedbackLink: 'http://survey.kb.se/librisbeta/en',
		customerSupport: 'Libris customer support',
		cookies: 'Manage cookies'
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
		hasInstanceType: 'Format',
		genreForm: 'Genre/form',
		itemHeldBy: 'Library',
		bibliography: 'Bibliography',
		contributor: 'Contribution',
		language: 'Language',
		subject: 'Subject',
		yearPublished: 'Year published',
		intendedAudience: 'Intended audience',
		nationality: 'Nationality',
		hasOccupation: 'Has Occupation',
		fieldOfActivity: 'Field of Activity',
		boolFilters: 'Other',
		limitInfo: 'Some options are not displayed',
		limitText:
			'The list shows a limited number of options, the most common ones related to your search. Try narrowing your search to get other, more relevant options.'
	},
	search: {
		search: 'Search',
		searchResults: 'Search results',
		loading: 'Loading...',
		findFilter: 'Find filter',
		filters: 'Filters',
		activeFilter: 'Active filter',
		selectedFilters: 'Selected filters',
		clearFilters: 'Clear',
		editFilters: 'Edit',
		removeFilter: 'Remove filter',
		noResults: 'No results',
		hitsOf: 'of',
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
		pagination: 'pagination',
		previous: 'Previous page',
		page: 'Page',
		next: 'Next page',
		showMore: 'Show more',
		showFewer: 'Show fewer',
		showDetails: 'Show more',
		hideDetails: 'Show less',
		occursAs: 'as',
		relatedSearchLabel: 'Search the results',
		didYouMean: 'Did you mean',
		showAllResults: 'Show all results',
		supersearchStartHeader: 'Build and refine your search query'
	},
	qualifiers: {
		contributorKey: 'contributor',
		contributorLabel: 'Contributor',
		contributorPlaceholder: 'Selma Lagerlöf, Astrid Lindgren',
		titleKey: 'title',
		titleLabel: 'Title',
		titlePlaceholder: 'The Serious Game, Casablanca',
		languageKey: 'language',
		languageLabel: 'Language',
		languagePlaceholder: 'Swedish, English, Arabic',
		subjectKey: 'subject',
		subjectLabel: 'Subject',
		subjectPlaceholder: 'Sommaren, Romerska riket',
		yearKey: 'year',
		yearLabel: 'Year',
		yearPlaceholder: '2002, 1987-1994',
		genreFormKey: 'genreForm',
		genreFormLabel: 'Genre/form',
		genreFormPlaceholder: 'Fiction'
	},
	sort: {
		sort: 'Sort',
		relevancy: 'Relevancy',
		alphaAsc: 'A-Z',
		alphaDesc: 'Z-A',
		publicationAsc: 'Oldest first (publication year)',
		publicationDesc: 'Newest first (publication year)',
		linksDesc: 'Most linked',
		hitsAsc: 'Hits asc.',
		hitsDesc: 'Hits desc.',
		yearAsc: 'Oldest first',
		yearDesc: 'Newest first'
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
		year: 'Year',
		usagePolicy: 'License terms',
		cropped: 'Cropped'
	},
	holdings: {
		availableAt: 'Available at',
		library: 'library',
		libraries: 'libraries',
		findLibrary: 'Find library',
		findAtYourNearestLibrary: 'Find it at your nearest library',
		location: 'Location',
		shelf: 'Shelf',
		status: 'Status',
		date: 'Date',
		loanPolicy: 'Loan policy',
		libraryUnvaliable: 'Loan status is not available for this library',
		loanStatusFailed: 'Failed to get loan status',
		available: 'Available',
		unavailable: 'Not available',
		map: 'map'
	}
};
