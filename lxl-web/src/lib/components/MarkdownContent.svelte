<div>
	<slot />
</div>

<style lang="postcss">
	@reference "../../app.css";

	div {
		& :global(h1) {
			@apply text-6-cond-extrabold;
		}

		& :global(h2) {
			@apply text-5-cond-extrabold mt-6;
		}

		& :global(h3) {
			@apply text-3-cond-bold mt-6;
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
