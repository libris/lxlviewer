import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { HoldingStatus } from '$lib/types/api';

export async function GET({ url }) {
	const sigel = url.searchParams.get('sigel');
	const bib_id = url.searchParams.get('bib_id');
	const res = await fetch(`${env.HOLDING_STATUS_URL}?output=json&sigel=${sigel}&bib_id=${bib_id}`);
	const data = (await res.json()) as HoldingStatus;

	return json(data);
}
