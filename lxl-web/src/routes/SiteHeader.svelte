<header>
	<nav>
		<a class="home" href="/">Libris</a>
		<form class="search" action="find">
			<input type="search" placeholder="Sök på titel, författare, ämne" />
		</form>
		<ul class="actions">
			<li class="search-action"><a href="/">O</a></li>
			<li><a href="/">A</a></li>
			<li><a href="/">B</a></li>
			<li><a href="/">C</a></li>
		</ul>
	</nav>
</header>

<style>
	header nav {
		display: grid;
		grid-template-areas: 'home actions';
		align-items: center;
		gap: var(--gap-base);
		padding: var(--padding-base);

		@media screen and (min-width: 900px) {
			grid-template-columns: 1fr 4fr 1fr;
			grid-template-areas: 'home search actions';
		}
	}

	.home {
		grid-area: home;
		color: inherit;
		text-decoration: none;
	}

	.search {
		display: none;
		grid-area: search;

		& > input {
			width: 100%;
			min-height: var(--height-input);
		}

		@media screen and (min-width: 900px) {
			display: block;
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

	.search-action {
		@media screen and (min-width: 900px) {
			display: none;
		}
	}
</style>
