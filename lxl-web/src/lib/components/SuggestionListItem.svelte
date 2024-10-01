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
	import {
		getTypeQualifierLink,
		getFullQualifierLink
	} from '$lib/utils/supersearch/qualifierLinks';
	import IconAddQualifier from '~icons/mdi/arrow-top-left';
	import IconGotoQualfier from '~icons/bi/arrow-right-circle';

	type SuggestionListItemProps = {
		data: Suggestion;
		initialQuery: string;
		onaddqualifier?: (event: QualifierEvent) => void;
		onpreviewqualifierstart?: (event: QualifierEvent) => void;
		onpreviewqualifierend?: (event: QualifierEvent) => void;
	};

	let {
		data,
		initialQuery,
		onaddqualifier,
		onpreviewqualifierstart,
		onpreviewqualifierend
	}: SuggestionListItemProps = $props();
</script>

{#snippet label(label: string)}
	<span class="label">{label}</span>&nbsp;
{/snippet}

{#snippet heading()}
	{data.heading}
	{#if data.inSchemeCode}
		<span class="inScheme">
			•
			<abbr title={`${data.typeLabel} • ${data.inSchemeLabel}`}>{data.inSchemeCode}</abbr>
		</span>
	{/if}
{/snippet}

<li class="list-item">
	<hgroup>
		<p class="type" data-type={data['@type']}>
			{#if data.qualifier?.changes.type}
				{@const typeQualifierData = {
					change: data.qualifier.changes.type,
					initialQuery,
					href: getTypeQualifierLink({ initialQuery, change: data.qualifier.changes.type })
				}}
				<a
					href={typeQualifierData.href}
					onclick={(event) => {
						event.preventDefault();
						onaddqualifier?.(typeQualifierData);
					}}
					onmouseover={() => onpreviewqualifierstart?.(typeQualifierData)}
					onmouseleave={() => onpreviewqualifierend?.(typeQualifierData)}
					onfocus={() => onpreviewqualifierstart?.(typeQualifierData)}
					onblur={() => onpreviewqualifierend?.(typeQualifierData)}
				>
					{@render label(`${data.qualifier.label}:`)}
				</a>
			{:else}
				{@render label(data.typeLabel)}
			{/if}
		</p>
		<h3 class="heading">
			{#if data.qualifier?.changes.full}
				{@const fullQualifierData = {
					change: data.qualifier.changes.full,
					initialQuery,
					href: getFullQualifierLink({ initialQuery, change: data.qualifier.changes.full })
				}}
				<a
					href={fullQualifierData.href}
					onclick={(event) => {
						event.preventDefault();
						onaddqualifier?.(fullQualifierData);
					}}
					onmouseover={() => onpreviewqualifierstart?.(fullQualifierData)}
					onmouseleave={() => onpreviewqualifierend?.(fullQualifierData)}
					onfocus={() => onpreviewqualifierstart?.(fullQualifierData)}
					onblur={() => onpreviewqualifierend?.(fullQualifierData)}
				>
					{@render heading()}
				</a>
			{:else}
				{@render heading()}
			{/if}
		</h3>
	</hgroup>
	<nav class="actions">
		<ul>
			{#if data.qualifier}
				<li><IconAddQualifier /></li>
			{/if}
			<li><a href={data.fnurgel}><IconGotoQualfier /></a></li>
		</ul>
	</nav>
</li>

<style>
	.list-item {
		display: flex;
		gap: var(--gap-sm);
		padding: 0 var(--padding-base);
		&:focus-within,
		&:hover {
			background: #f3f3f3;
		}
		&::before {
			display: none;
		}
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	hgroup {
		display: flex;
		align-items: stretch;
		width: 100%;
		min-height: var(--height-input-sm);
		overflow: hidden;
		font-size: var(--font-size-sm);

		& :global(> *) {
			display: flex;
			align-items: center;
			margin: 0;
			height: 100%;
		}

		& :global(a) {
			display: flex;
			flex: 1;
			align-items: center;
			margin: 0;
			height: 100%;
		}
	}

	.heading {
		flex-grow: 1;
		font-weight: 500;
		font-size: inherit;
		white-space: nowrap;
	}

	.type {
		color: var(--color-super-subtle);
		font-weight: 400;

		&:first-letter {
			text-transform: uppercase;
		}
	}

	.label {
		&:first-letter {
			text-transform: uppercase;
		}
	}

	.inScheme {
		margin-left: var(--gap-xs);
		color: var(--color-super-subtle);
		font-weight: normal;
		font-size: var(--font-size-2xs);
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
