<script module lang="ts">
	export type QualifierEvent = {
		initialQuery: string;
		change: {
			from: number;
			to?: number;
			insert: string;
		};
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

<li class="list-item">
	<hgroup>
		<p class="type" data-type={data['@type']}>
			{#if data.qualifier?.changes.type}
				{@const qualifierData = {
					change: data.qualifier.changes.type,
					initialQuery
				}}
				<a
					href={getTypeQualifierLink({ initialQuery, change: qualifierData.change })}
					onclick={(event) => {
						event.preventDefault();
						onaddqualifier?.(qualifierData);
					}}
					onmouseover={() => onpreviewqualifierstart?.(qualifierData)}
					onmouseleave={() => onpreviewqualifierend?.(qualifierData)}
					onfocus={() => onpreviewqualifierstart?.(qualifierData)}
					onblur={() => onpreviewqualifierend?.(qualifierData)}
				>
					{data.qualifier?.label}
				</a>
			{:else}
				{data.typeLabel}
			{/if}
		</p>
		<h3 class="heading">
			{#if data.qualifier?.changes.full}
				{@const qualifierData = {
					change: data.qualifier.changes.full,
					initialQuery
				}}
				<a
					href={getFullQualifierLink({ initialQuery, change: qualifierData.change })}
					onclick={(event) => {
						event.preventDefault();
						onaddqualifier?.(qualifierData);
					}}
					onmouseover={() => onpreviewqualifierstart?.(qualifierData)}
					onmouseleave={() => onpreviewqualifierend?.(qualifierData)}
					onfocus={() => onpreviewqualifierstart?.(qualifierData)}
					onblur={() => onpreviewqualifierend?.(qualifierData)}
				>
					{data.heading}
				</a>
			{:else}
				{data.heading}
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
		justify-content: space-between;
		gap: var(--gap-sm);
		padding: 0 var(--padding-base);

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
