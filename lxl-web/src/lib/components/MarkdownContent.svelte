<div>
	<slot />
</div>

<style lang="postcss">
	div {
		& :global(h1) {
			@apply mt-6 text-6-cond-extrabold;
		}

		& :global(h2) {
			@apply mt-6 text-5-cond-extrabold;
		}

		& :global(h3) {
			@apply mt-6 text-3-cond-bold;
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
