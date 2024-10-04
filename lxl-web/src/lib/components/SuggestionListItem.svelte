<script module lang="ts">
	export type QualifierEvent = {
		initialQuery: string;
		change: {
			from: number;
			to?: number;
			insert: string;
		};
		href: string;
	};
</script>

<script lang="ts">
	import type { Suggestion } from '../../routes/api/[[lang=lang]]/suggest/+server';
	import { getFullQualifierLink } from '$lib/utils/supersearch/qualifierLinks';

	type SuggestionListItemProps = {
		data: Suggestion;
		initialQuery: string;
		onaddqualifier?: (event: QualifierEvent, options?: { updateUrl: boolean }) => void;
		onpreviewqualifierstart?: (event: QualifierEvent) => void;
		onpreviewqualifierend?: (event: QualifierEvent) => void;
	};

	let { data, initialQuery, onaddqualifier }: SuggestionListItemProps = $props();
</script>

{#snippet heading()}
	<hgroup>
		{#if data.qualifier}
			<p class="action"><span class="action-label">Lägg till</span></p>
		{:else}
			<p class="action"><span class="action-label">Gå till</span></p>
		{/if}
		<p class="type">{data.qualifier?.label || data.typeLabel}</p>
		<h3>
			{data.heading}
			{#if data.inSchemeCode}
				<span class="inScheme">
					•
					<abbr title={`${data.typeLabel} • ${data.inSchemeLabel}`}>{data.inSchemeCode}</abbr>
				</span>
			{/if}
		</h3>
	</hgroup>
{/snippet}

<li class="list-item">
	{#if data.qualifier?.changes}
		{@const qualifierData = {
			change: data.qualifier.changes,
			initialQuery,
			href: getFullQualifierLink({ initialQuery, change: data.qualifier.changes })
		}}
		<a
			href={qualifierData.href}
			onclick={(event) => {
				event.preventDefault();
				onaddqualifier?.(qualifierData);
			}}
		>
			{@render heading()}
		</a>
	{:else}
		{@render heading()}
	{/if}
	{#if data.qualifier}
		<a class="action" href={data.fnurgel}>
			<span class="action-label">Gå till</span>
		</a>
	{/if}
</li>

<style>
	.list-item {
		display: flex;
		font-size: var(--font-size-sm);
		white-space: nowrap;

		&:focus-within,
		&:hover {
			background: #f3f3f3;
		}
		&::before {
			display: none;
		}
	}

	.list-item > * {
		padding: 0 var(--padding-base);
	}

	.list-item > *:first-child {
		padding-right: 0;
	}

	a {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: var(--height-input-base);
		min-height: var(--height-input-base);
		color: inherit;
		text-decoration: none;

		&:first-child {
			flex-grow: 1;
		}
	}

	hgroup {
		display: flex;
		flex-grow: 1;
		align-items: center;
		gap: var(--gap-sm);
		width: 100%;
		overflow: hidden;
	}

	hgroup > * {
		margin: 0;
	}

	h3 {
		flex-grow: 1;
		font-weight: 500;
		font-size: inherit;
		white-space: nowrap;
	}

	.action {
		display: flex;
		order: 1;
		gap: var(--gap-xs);
	}

	.action-label {
		margin-left: var(--gap-xs);
		color: var(--color-super-subtle);
		font-size: var(--font-size-xs);
	}

	a:hover .action-label,
	a:focus .action-label {
		color: var(--color-base);
	}

	.type {
		color: var(--color-super-subtle);
		font-weight: 400;

		&:first-letter {
			text-transform: uppercase;
		}
	}

	.inScheme {
		color: var(--color-super-subtle);
		font-weight: normal;
		font-size: var(--font-size-2xs);
	}
</style>
