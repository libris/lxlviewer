import { getSupportedLocale } from '$lib/i18n/locales';
import type { HoldingsData } from '$lib/types/holdings.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, params, fetch }) => {
	// makes load function run on every navigation
	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}

	const holdingParam = url.searchParams.get('holdings');
	const locale = getSupportedLocale(params?.lang);

	async function getHoldings(fnurgel: string): Promise<HoldingsData> {
		const res = await fetch(`/api/${locale}/${fnurgel}/holdings`);
		const holdings = await res.json();
		return holdings;
	}

	if (holdingParam) {
		return { holdings: getHoldings(holdingParam) };
	} else {
		return {};
	}
};
