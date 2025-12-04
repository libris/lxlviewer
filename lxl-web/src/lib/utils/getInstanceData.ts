import jmespath from 'jmespath';
import type { ResourceData } from '$lib/types/resourceData';

// TODO: doesn't handle PrimaryPublication correctly
// TODO: extracting these from the decorated data becomes very convoluted
function getInstanceData(instances: ResourceData) {
	if (typeof instances === 'object') {
		const oneInstancePrimary = jmespath.search(
			instances,
			'(_display[].publication[])[?"@type" == \'PrimaryPublication\']'
		);
		const startYear = jmespath.search(oneInstancePrimary, '[]._display[?startYear].startYear[]') as
			| string[]
			| null;
		const endYear = jmespath.search(oneInstancePrimary, '[]._display[?endYear].endYear[]') as
			| string[]
			| null;

		if ((startYear && startYear.length) || (endYear && endYear.length)) {
			const count = 1;
			const years = `${(startYear || []).join(', ')}-${(endYear || []).join(', ')}`;
			return { count, years };
		}

		let years: string = '';
		let count = 1;
		let query = '_display[].publication[].*[][?year].year[]';

		if (Array.isArray(instances)) {
			count = instances.length;
			query = '[]._display[].publication[].*[][?year].year[]';
		}

		const res = jmespath.search(instances, query) as string[] | null;

		if (res) {
			const NUM_NEW = 3;
			const NUM_OLD = 1;
			const y = res
				.filter((el, i, arr) => !isNaN(parseInt(el)) && arr.indexOf(el) === i)
				.sort()
				.filter((el, i, arr) => i <= NUM_OLD || i >= arr.length - NUM_NEW);
			if (y.length <= NUM_NEW + NUM_OLD) {
				years = y.join(', ');
			} else {
				years = y.slice(0, NUM_OLD).join(', ') + ' … ' + y.slice(-NUM_NEW, y.length).join(', ');
			}
		}

		return { count, years };
	}
	return null;
}

export default getInstanceData;
