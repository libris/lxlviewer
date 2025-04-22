<div>
	<slot />
</div>

<style lang="postcss">
	@reference "../../app.css";

	div {
		& :global(h1) {
		}

		& :global(h2) {
			@apply mt-6;
		}

		& :global(h3) {
			@apply mt-6;
		}

		& :global(p) {
			@apply mt-4;
		}

		& :global(ul) {
			@apply list-disc ps-4;
		}

		& :global(li) {
			@apply mt-2;
		}
	}
</style>
