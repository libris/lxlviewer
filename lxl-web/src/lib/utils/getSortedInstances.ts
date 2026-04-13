import type { FramedData } from '$lib/types/xl';
import jmespath from 'jmespath';

export function getSortedInstances(instances: FramedData[]) {
	return instances.sort((a, b) => {
		const yearA = parseInt(jmespath.search(a, 'publication[0].year'), 10);
		const yearB = parseInt(jmespath.search(b, 'publication[0].year'), 10);

		if (Number.isNaN(yearA)) {
			return 1;
		}

		if (Number.isNaN(yearB)) {
			return -1;
		}
		return yearB - yearA;
	});
}
