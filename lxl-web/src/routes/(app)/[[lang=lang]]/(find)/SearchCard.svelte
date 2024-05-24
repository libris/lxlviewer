<script lang="ts">
	import type { SearchResultItem } from './search';

	export let item: SearchResultItem;

	$: console.log('item', item);
</script>

<article class="search-card">
	<!-- svelte-ignore a11y-missing-content -->
	<!-- (content shouldn't be needed as we're using aria-labelledby, see: https://github.com/sveltejs/svelte/issues/8296) -->
	<a
		class="card-link"
		href="/"
		aria-labelledby="id-title-here"
		aria-describedby="id-body-here id-footer-here"
	></a>
	<div class="card-image"></div>
	<header class="card-header" id="id-title-here">
		<hgroup>
			<h1 class="text-4-cond-bold">title</h1>
			<p>transliteration</p>
		</hgroup>
		<p><a href="/test">original title</a></p>
	</header>
	<div class="card-body" id="id-body-here">body</div>
	<footer class="card-footer" id="id-footer-here">footer</footer>
</article>

<style lang="postcss">
	.search-card {
		display: grid;
		position: relative;
		grid-template-areas:
			'image header'
			'image body'
			'image footer';
		grid-template-columns: 128px 1fr;

		&:has(a:hover) {
			@apply shadow-xl;
		}
	}

	.card-link {
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 0;
		cursor: pointer;
	}

	a:not(.card-link) {
		position: relative; /* needed to allow mouse events on links above card-link */
	}

	.card-image {
		grid-area: image;
	}

	.card-header {
		grid-area: header;
	}

	.card-body {
		grid-area: body;
	}

	.card-footer {
		grid-area: footer;
	}
</style>
