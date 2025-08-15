/* eslint-disable @typescript-eslint/no-unused-vars */
export async function load({ depends, url, fetch }) {
	console.log('getting holdings');
	// depends(url.searchParams.get('holdings'));

	// not working, is now dependent on 'search' param too
	// const searchParams = new URLSearchParams(url.searchParams.toString());
	// const holdingsParam = searchParams.get('holdings');

	// does not run this load function on 'search' change
	const holdingsParam = url.searchParams.get('holdings');

	async function getHoldings() {
		const res = await fetch('/api/hello?holdings=' + holdingsParam);
		const { holdings } = await res.json();
		return holdings;
	}

	return { holdings: getHoldings() };
}
