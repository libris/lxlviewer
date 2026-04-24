import { redirect } from '@sveltejs/kit';

export function load({ params }) {
	// todo alias
	throw redirect(
		302,
		`${params.lang ? '/' + params.lang : ''}/find?_q=_collections&_sort=_sortKeyByLang.sv`
	);
}
