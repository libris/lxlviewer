<script lang="ts">
	import IconSearch from '~icons/bi/search';
	import IconUser from '~icons/bi/person';
	import IconHelp from '~icons/bi/question-circle';
	import IconMenu from '~icons/bi/list';
	import * as m from '$lib/paraglide/messages.js';
	import Search from '$lib/components/Search.svelte';
</script>

<header>
	<nav>
		<div class="home">
			<a href="/">Libris</a>
		</div>
		<div class="search">
			<Search />
		</div>
		<ul class="actions">
			<li class="search-action">
				<a href="/"><IconSearch style="font-size: 20px" />{m.search()}</a>
			</li>
			<li class="user-action"><a href="/"><IconUser style="font-size: 20px" />{m.login()}</a></li>
			<li class="help-action"><a href="/"><IconHelp style="font-size: 20px" />{m.help()}</a></li>
			<li><a href="/"><IconMenu style="font-size: 20px" />{m.menu()}</a></li>
		</ul>
	</nav>
</header>

<style>
	header {
		box-shadow: var(--box-shadow-border-bottom);
		background: var(--background-header);
	}
	header nav {
		display: grid;
		grid-template-areas: 'home actions';
		align-items: center;
		gap: var(--gap-base);
		padding: 0 var(--padding-base);
		min-height: 72px;

		@media screen and (min-width: 810px) {
			grid-template-columns: 1fr 4fr 1fr;
			grid-template-areas: 'home search actions';
		}
	}

	.home {
		grid-area: home;
		font-weight: 700;
		font-size: 2rem;
		& a {
			color: inherit;
			text-decoration: none;
		}
	}

	.search {
		display: none;
		grid-area: search;
		@media screen and (min-width: 810px) {
			display: contents;
		}
	}

	.actions {
		display: flex;
		grid-area: actions;
		justify-content: flex-end;
		align-items: center;
		gap: var(--gap-2xs);
		margin: 0;

		& a {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: var(--gap-2xs);
			min-width: var(--height-input-lg);
			min-height: var(--height-input-lg);
			color: var(--color-subtle);
			font-size: var(--font-size-2xs);
			letter-spacing: -0.0125em;
			text-decoration: none;

			&:hover,
			&:focus {
				color: var(--color-base);
				text-decoration: underline;
			}
		}
	}

	.search-action {
		@media screen and (min-width: 810px) {
			display: none;
		}
	}

	.user-action,
	.help-action {
		display: none;

		@media screen and (min-width: 1280px) {
			display: block;
		}
	}
</style>
