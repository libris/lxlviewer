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
		<p class="type" data-type={data['@type']}>
			<a href={data.qualifierTypeLink}>
				{data.typeLabel}
				{#if data.inSchemeCode}
					<span class="inScheme">
						<abbr title={data.inSchemeLabel}>{data.inSchemeCode}</abbr>
					</span>
				{/if}
			</a>
		</p>
		<h3 class="heading">
			<a href={data.qualifierLink}>
				{data.heading}
			</a>
		</h3>
		{#if data.overview}
			<p class="overview">
				{data.overview}
			</p>
		{/if}
	</hgroup>
	<nav class="actions">
		<ul>
			{#if data.qualifierType}
				<li><IconAddQualifier /></li>
			{/if}
			<li><a href={data.resourceLink}><IconGotoQualfier /></a></li>
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
		font-size: var(--font-size-sm);

		& :global(> *) {
			margin: 0;
		}
	}

	.heading {
		flex-grow: 1;
		font-weight: 500;
		font-size: inherit;
		white-space: nowrap;

		&:first-letter {
			text-transform: uppercase;
		}
	}

	.overview {
		overflow: hidden;
		color: var(--color-subtle);
		font-weight: normal;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.inScheme {
		font-weight: normal;
		&::before {
			content: ' • ';
		}
	}

	.type {
		border-radius: var(--border-radius-sm);
		background: #ebebeb;
		padding: var(--gap-2xs) var(--gap-xs);
		color: var(--color-subtle);
		font-weight: 500;
		font-size: var(--font-size-2xs);
		white-space: nowrap;

		&:first-letter {
			text-transform: uppercase;
		}
	}

	.type[data-type='Topic'] {
		background: #d4e3ef;
		color: #205999;
	}

	.type[data-type='Person'] {
		background: #d9ebdc;
		color: #196f25;
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
