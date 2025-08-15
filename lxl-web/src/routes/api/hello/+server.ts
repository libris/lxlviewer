import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	console.log('api call');
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	await sleep(1000);

	const res = {
		search: parseInt(url.searchParams.get('search')) + 1,
		holdings: parseInt(url.searchParams.get('holdings')) + 1
	};

	return json(res);
}
