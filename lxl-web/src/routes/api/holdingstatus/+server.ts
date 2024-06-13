import { env } from '$env/dynamic/private';
import type { HoldingStatus } from '$lib/types/api';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const sigel = url.searchParams.get('sigel');
	const bib_id = url.searchParams.get('bib_id');
	const res = await fetch(`${env.HOLDING_STATUS_URL}?output=json&sigel=${sigel}&bib_id=${bib_id}`);

	// TODO error handling, map statuses
	// see https://github.com/libris/search4/blob/09180a39077619b2e4f4ba0887f9474679b40489/src/views/ProductPage/Work/Holding.vue#L64

	const data = (await res.json()) as HoldingStatus;

	return json(data);
}
