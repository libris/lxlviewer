<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="find">
	<aside>
		<header><h2>{m.filter()}</h2></header>
	</aside>
	<slot></slot>
</div>

<style>
	.find {
		display: grid;
		grid-template-columns: minmax(240px, calc(100% / 6 + 48px + 16px)) 1fr; /* 16px for gap */
		height: 100%;
	}

	aside {
		display: none;
		box-shadow: var(--box-shadow-border-right);
		background: var(--background-aside);
		padding: 0 var(--padding-base);

		& header {
			display: flex;
			align-items: center;
			min-height: var(--height-input-base);

			& h2 {
				margin: 0;
				font-weight: inherit;
				font-size: var(--font-size-sm);
			}
		}

		@media screen and (min-width: 810px) {
			display: block;
		}
	}
</style>
