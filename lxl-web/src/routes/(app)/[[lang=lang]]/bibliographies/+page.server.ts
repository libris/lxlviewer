import { redirect } from '@sveltejs/kit';

export function load({ params }) {
	// todo alias
	throw redirect(
		302,
		`${params.lang ? '/' + params.lang : ''}/find?_q=typ:(bibliografi) comment:()&_sort=_sortKeyByLang.sv`
	);
}
