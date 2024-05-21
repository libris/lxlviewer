<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<link
		rel="preload"
		as="font"
		href="/fonts/InterVariable.woff2"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>
<header>
	<nav>
		<a class="home" href="/">Libris</a>
		<form class="search" action="find">
			<input type="search" placeholder="Sök på titel, författare, ämne" />
		</form>
		<ul class="actions">
			<li><a href="/">A</a></li>
			<li><a href="/">B</a></li>
			<li><a href="/">C</a></li>
		</ul>
	</nav>
</header>
<main>
	<slot />
</main>

<style>
	header nav {
		display: grid;
		grid-template-areas:
			'home actions'
			'search search';
		align-items: center;
		padding: var(--padding-page);

		@media screen and (min-width: 640px) {
			grid-template-columns: 1fr 2fr 1fr;
			grid-template-areas: 'home search actions';
		}
	}

	.home {
		grid-area: home;
		color: inherit;
		text-decoration: none;
	}

	.search {
		grid-area: search;

		& > input {
			width: 100%;
			min-height: var(--height-input);
		}
	}

	.actions {
		display: flex;
		grid-area: actions;
		justify-content: flex-end;
		align-items: center;
		margin: 0;

		& a {
			display: flex;
			justify-content: center;
			align-items: center;
			width: var(--height-input);
			height: var(--height-input);
		}
	}
</style>
