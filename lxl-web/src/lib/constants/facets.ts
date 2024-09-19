export const DEFAULT_FACETS_SHOWN = 5;
export const DEFAULT_FACET_SORT = 'hits.desc';
// Copied from https://github.com/libris/definitions/blob/develop/source/apps.jsonld, TODO better solution...
export const FACET_LIMITS = {
	instanceOfType: { itemLimit: 100 },
	'rdf:type': { itemLimit: 100 },
	hasInstanceType: { itemLimit: 100 },
	contributor: { itemLimit: 20 },
	genreForm: { itemLimit: 100 },
	subject: { itemLimit: 100 },
	language: { itemLimit: 100 },
	intendedAudience: { itemLimit: 100 },
	yearPublished: { itemLimit: 500 },
	bibliography: { itemLimit: 200 },
	itemHeldBy: { itemLimit: 1000 },
	nationality: { itemLimit: 100 },
	hasOccupation: { itemLimit: 100 },
	fieldOfActivity: { itemLimit: 100 }
};
