<div class="find">
	<aside>
		<header></header>
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
		}

		@media screen and (min-width: 810px) {
			display: block;
		}
	}
</style>
