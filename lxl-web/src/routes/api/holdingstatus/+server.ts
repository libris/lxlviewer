import { HOLDING_STATUS_URL } from '$app/env/private';

export async function GET({ url }) {
	const res = await fetch(`${HOLDING_STATUS_URL}?${url.searchParams.toString()}&output=json`);
	if (res.ok) {
		const data = await res.json();
		const cleanData = replaceChars(data);
		return Response.json(cleanData);
	}
	return res;
}

// Replace ISO-8859-1 encoded chars returned by some libraries
function replaceChars(data: Response) {
	const d = JSON.stringify(data)
		.replaceAll('Ã¥', 'å')
		.replaceAll('Ã…', 'Å')
		.replaceAll('Ã¤', 'ä')
		.replaceAll('Ã\\?', 'Ö')
		.replaceAll('Ã„', 'Ä')
		.replaceAll('Ã¶', 'ö')
		.replaceAll('&quot;', '\\"')
		.replaceAll('Ã©', 'é');

	return JSON.parse(d);
}
