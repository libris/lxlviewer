<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	// async function loadNewHolding(){
	// 	await invalidate('app:holdings')
	// }

	// async function loadNewResult(){
	// 	await invalidate('app:result')
	// }

	function randomIntFromInterval(min: number, max: number) {
		// min and max included
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function getNewResultLink(p: string) {
		let param = new SvelteURLSearchParams(page.url.searchParams.toString());
		param.set(p, randomIntFromInterval(1, 100).toString());
		return param.toString();
	}
</script>

<div class="m-6">
	<p>Search result: {page.data.searchResult}</p>
	<p>
		Holdings:
		{#await page.data.holdings}
			Laddar....
		{:then holdings}
			{holdings}
		{/await}
	</p>
	<!-- <button class="btn btn-cta" onclick={loadNewResult}>Load new results</button>
	<button class="btn btn-cta" onclick={loadNewHolding}>Load new holdings</button> -->
	<a class="btn btn-cta" href={'/hello?' + getNewResultLink('search')}>Load new search</a>
	<a class="btn btn-cta" href={'/hello?' + getNewResultLink('holdings')}>Load new holdings</a>
</div>
