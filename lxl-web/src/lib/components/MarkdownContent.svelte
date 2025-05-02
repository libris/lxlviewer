<div>
	<slot />
</div>

<style lang="postcss">
	@reference "tailwindcss";

	div {
		& :global(h1) {
			font-family: var(--font-heading);
			font-size: var(--text-3xl);
			font-weight: var(--font-weight-medium);
		}

		& :global(h2) {
			margin-top: calc(var(--spacing) * 6);
			font-family: var(--font-heading);
			font-size: var(--text-2xl);
			font-weight: var(--font-weight-medium);
		}

		& :global(h3) {
			margin-top: calc(var(--spacing) * 6);
			font-size: var(--text-lg);
			font-weight: var(--font-weight-medium);
		}

		& :global(p) {
			margin-top: calc(var(--spacing) * 4);
			font-size: var(--text-base);

		}

		& :global(ul) {
			list-style-type: disc;
			padding-inline-start: calc(var(--spacing) * 4)
			font-size: var(--text-base);
		}

		& :global(li) {
			margin-top: calc(var(--spacing) * 2)
		}

		& :global(code) {
			font-size: var(--text-sm);
			background-color: var(--color-neutral-100);
			padding: calc(var(--spacing) * 1);
		}

		& :global(a) {
			text-decoration: underline;
			text-decoration-style: dotted;
			
				&:hover {
				text-decoration-style: solid;
			}
		}
	}
</style>
