<script lang="ts">
	import type { JsonLd } from '$lib/utils/xl';
	import IconPerson from '~icons/mdi/person-circle';
	import IconLanguage from '~icons/mdi/language';
	import IconClose from '~icons/mdi/remove';
	import { page } from '$app/stores';

	type QualifierWidgetProps = {
		type: string;
		value: string;
		resource: { [JsonLd.ID]: string; [JsonLd.TYPE]: string };
		range: { from: number; to: number };
	};

	let { type, value, resource, range }: QualifierWidgetProps = $props();

	let removeUrl = $derived.by(() => {
		const url = new URL($page.url);
		const _q = $page.url.searchParams.get('_q');
		if (_q) {
			url.searchParams.set('_q', _q.slice(0, range.from) + _q.slice(range.to)); // remove qualifier part
		}
		return url;
	});
</script>

<span class="qualifier" class:resource>
	<span class="type">{type}</span>
	{#if resource?.['@type'] === 'Language'}
		<span class="type-icon">
			<IconLanguage />
		</span>
	{:else if resource?.['@type'] === 'Person'}
		<span class="type-icon">
			<IconPerson />
		</span>
	{/if}
	<span class="value">
		{value}
	</span>
	{#if resource}
		<a href={removeUrl.toString()} tabindex="-1" class="remove">
			<IconClose style="font-size:14px;" />
		</a>
	{/if}
</span><span class="nbsp">&nbsp;</span>

<style>
	.qualifier {
		display: inline-flex;
		position: relative;
		align-items: center;
		border-radius: var(--border-radius-base);
		background: rgba(14, 113, 128, 0.15);
		padding: 0 var(--padding-2xs);
		max-width: 15vw;
		min-height: 24px;
		overflow: hidden;
		font-size: var(--font-size-2xs);
		white-space: nowrap;
	}

	.qualifier > * {
		font-size: var(--font-size-2xs);
	}

	.type {
		margin-right: var(--padding-3xs);
		border-right: 1px solid rgba(14, 113, 128, 0.15);
		padding-right: var(--padding-3xs);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-3xs);
		&::first-letter {
			text-transform: capitalize;
		}
	}

	.value {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.resource {
		padding-right: 0;
		font-weight: var(--font-weight-normal);
	}

	.resource .value {
		color: var(--color-link);
	}

	.remove {
		display: inline-flex;
		padding: 0 var(--padding-2xs) 0 var(--padding-3xs);
		color: var(--color-subtle);

		&:hover {
			color: var(--color-base);
		}
	}

	.type-icon {
		display: inline-flex;
		align-self: center;
		margin-right: 2px;
		color: var(--color-link);
		font-size: inherit;
		font-size: var(--font-size-xs);
	}
</style>
