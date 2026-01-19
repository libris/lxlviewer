import * as v from 'valibot';

export const SearchResultsSchema = v.object({
	_q: v.string(),
	_limit: v.optional(v.pipe(v.number(), v.toString())),
	_offset: v.optional(v.pipe(v.number(), v.toString())),
	_sort: v.optional(v.string()),
	_spell: v.optional(v.pipe(v.boolean(), v.toString())),
	_r: v.optional(v.string()),
	_stats: v.optional(v.pipe(v.boolean(), v.toString()))
});
