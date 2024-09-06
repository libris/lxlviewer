<script lang="ts">
	import type { AutocompleteItem } from '$lib/types/autocomplete';
	import IconAddQualifier from '~icons/mdi/arrow-top-left'; // ~icons/mdi/arrow-top-left
	import IconGotoQualfier from '~icons/bi/arrow-right-circle';

	type AutocompleteListItemProps = {
		data: AutocompleteItem;
	};

	let { data }: AutocompleteListItemProps = $props(); // should we keep codemirror instances in sync using update listeners instead of binding to ensure history is kept as is (but will it work with when removing linebreaks?)? See: https://codemirror.net/examples/split/
</script>

<li class="list-item">
	<hgroup>
		<p class="type-label" title={data['@type']}>{data.typeLabel}</p>
		<h3 class="item-label">{data.label}</h3>
		{#if data.description}
			<p class="item-description">{data.description}</p>
		{/if}
	</hgroup>
	<nav class="actions">
		<ul>
			<li><IconAddQualifier /></li>
			<li><IconGotoQualfier /></li>
		</ul>
	</nav>
</li>

<style>
	.list-item {
		display: flex;
		justify-content: space-between;
		gap: var(--gap-sm);
		padding: 0 var(--padding-base);

		&::before {
			display: none;
		}
	}

	hgroup {
		display: flex;
		align-items: center;
		gap: var(--gap-sm);
		min-height: var(--height-input-sm);
		overflow: hidden;
	}

	.item-label {
		flex-grow: 1;
		margin: 0;
		font-weight: 500;
		font-size: var(--font-size-sm);
		white-space: nowrap;

		&:first-letter {
			text-transform: uppercase;
		}
	}

	.item-description {
		margin: 0;
		overflow: hidden;
		color: var(--color-super-subtle);
		font-style: italic;
		font-size: var(--font-size-2xs);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.type-label {
		margin: 0;
		color: var(--color-subtle);
		font-size: var(--font-size-2xs);
		white-space: nowrap;

		&:first-letter {
			text-transform: uppercase;
		}
	}

	.actions ul {
		display: flex;
		gap: var(--gap-base);
		padding: var(--gap-sm) 0;
		height: 100%;
	}

	.actions li {
		display: flex;
		align-items: center;
		color: var(--color-subtle);
		font-size: var(--font-size-xs);
		white-space: nowrap;
	}

	.actions li:not(:first-child) {
		border-left: 1px dotted #999;
		padding-left: var(--gap-base);
	}

	.actions :global(svg) {
		margin-left: var(--padding-2xs);
		color: var(--color-super-subtle);
		font-size: 18px;
	}
</style>
