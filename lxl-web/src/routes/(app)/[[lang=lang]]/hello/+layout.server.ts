/* eslint-disable @typescript-eslint/no-unused-vars */
export async function load({ depends, url, fetch }) {
	console.log('getting search result');
	// depends(url.searchParams.get('search'));

	// not working, this now runs when 'holding' changes, making it await the search result too
	// const searchParams = new URLSearchParams(url.searchParams.toString());
	// const searchParam = searchParams.get('search');

	const searchParam = url.searchParams.get('search');

	const res = await fetch('/api/hello?search=' + searchParam);
	const { search } = await res.json();

	return { searchResult: search };
}
