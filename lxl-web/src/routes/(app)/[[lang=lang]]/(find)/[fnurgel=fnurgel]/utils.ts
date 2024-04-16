import { goto } from '$app/navigation';

export function getHoldingsLink(url: URL, value: string) {
	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
	newSearchParams.set('holdings', value);
	return `${url.origin}${url.pathname}?${newSearchParams.toString()}`;
}

export function handleClickHoldings(
	event: MouseEvent & { currentTarget: HTMLAnchorElement },
	url: URL,
	state: object
) {
	event.preventDefault();
	if (url.href !== event.currentTarget.href) {
		goto(event.currentTarget.href, {
			state,
			noScroll: true
		});
	}
}
