import jmespath from 'jmespath';
import type { ResourceData } from '$lib/types/resourceData';

function getInstanceData(instances: ResourceData) {
	if (typeof instances === 'object') {
		let years: string = '';
		let count = 1;
		let query = '_display[].publication[].*[][?year].year[]';

		if (Array.isArray(instances)) {
			count = instances.length;
			query = '[]._display[].publication[].*[][?year].year[]';
		}

		const res = jmespath.search(instances, query) as string[] | null;
		if (res) {
			years = res
				.filter((el, i, arr) => !isNaN(parseInt(el)) && arr.indexOf(el) === i)
				.sort()
				.filter((el, i, arr) => i === 0 || i === arr.length - 1)
				.join('-');
		}

		return { count, years };
	}
	return null;
}

export default getInstanceData;
