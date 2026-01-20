import * as v from 'valibot';

export const SearchResultsSchema = v.pipe(
	v.object({
		_q: v.string(),
		_limit: v.optional(
			v.pipe(v.union([v.string(), v.number()]), v.toNumber(), v.number(), v.toString())
		),
		_offset: v.optional(
			v.pipe(v.union([v.string(), v.number()]), v.toNumber(), v.number(), v.toString())
		),
		_sort: v.optional(v.string()),
		_spell: v.optional(v.pipe(v.union([v.boolean(), v.string()]), v.toBoolean(), v.toString())),
		_r: v.optional(v.string()),
		_stats: v.optional(v.pipe(v.union([v.boolean(), v.string()]), v.toBoolean(), v.toString()))
	})
);
