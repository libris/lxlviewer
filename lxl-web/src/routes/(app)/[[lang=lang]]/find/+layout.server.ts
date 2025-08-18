import { redirect } from '@sveltejs/kit';

export const load = async ({ url, fetch }) => {
	console.log('layout load');

	// makes load function run on every navigation
	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}

	const holdingParam = url.searchParams.get('holdings');

	async function getHoldings(param: string) {
		const res = await fetch(`/api/holdings/${param}`);
		const holdings = await res.json();
		return holdings;
	}

	if (holdingParam) {
		return { holdings: getHoldings(holdingParam) };
	} else {
		return {};
	}
};
