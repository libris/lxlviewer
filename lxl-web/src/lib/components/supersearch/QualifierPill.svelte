<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { QualifierRendererProps } from 'supersearch';
	import { relativizeUrl, stripAnchor, trimSlashes } from '$lib/utils/http';
	import { getPersonImage } from '$lib/utils/getPersonImage';
	import IconClose from '~icons/bi/x-lg';
	import TypeIcon from '../TypeIcon.svelte';

	interface Props extends QualifierRendererProps {
		onclick?: () => void;
	}

	const {
		key,
		keyLabel,
		operator,
		value,
		valueLabel,
		removeLink,
		type,
		id,
		isRedundantKeyLabel,
		onclick
	}: Props = $props();

	const resourceId = $derived(stripAnchor(trimSlashes(relativizeUrl(id))));
	let image = $state(null);

	const getImage = async () => {
		image = await getPersonImage(resourceId as string);
	};

	onMount(() => {
		if (type === 'Person' && resourceId) {
			getImage();
		}
	});

	const pillText = $derived(`${keyLabel || ''}${operator} ${valueLabel || ''}`);

	/**
	 * TODO: Add resource links when API exposes the record ids/fnurgels in mappings
	 * const resourceLink = value?.match(/([a-z0-9]{15})#it"$/m)?.[1]; // only create links for fnurgels for now (lang:sv and similar should also be linkable in the future...)
	 */
</script>

{#snippet imageSnippet()}
			<span
				class="icon-wrapper my-1.25 inline-flex size-5 items-center justify-center align-bottom"
				aria-hidden="true"
			>
				{#if image}
					<img src={image} alt="" class="aspect-square rounded-full object-contain object-top" />
				{:else if type}
					<TypeIcon {type} class="text-sm" />
				{/if}
			</span>
		{/if}
{#snippet keyLabelSnippet()}
	<span
		data-qualifier-key={key}
		class={['lxl-qualifier-key cursor-text', isRedundantKeyLabel && 'redundant-label']}
		role="button"
		tabindex="-1"
		{onclick}
		onkeypress={onclick}>&nbsp;{keyLabel}</span
	>
{/snippet}
{#snippet operatorSnippet()}
	<span
		class={[
			'lxl-qualifier-operator cursor-text',
			(isRedundantKeyLabel || operator === ':') && 'hidden'
		]}
		data-qualifier-operator={operator}
		role="button"
		tabindex="-1"
		{onclick}
		onkeypress={onclick}>{operator}</span
	>
{/snippet}
{#snippet valueLabelSnippet()}
	<span
		class={[keyLabel && operator ? 'lxl-qualifier-value' : 'lxl-qualifier-alias', 'cursor-text']}
		data-qualifier-value={value}
		role="button"
		tabindex="-1"
		{onclick}
		onkeypress={onclick}
	></span>
{/snippet}
{#snippet removeLinkSnippet()}
	<a
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		href={page.data.localizeHref(removeLink)}
		class="lxl-qualifier-remove"
		aria-label={`${page.data.t('search.removeFilter')} ${pillText}`}
		><IconClose class="inline" aria-hidden="true" /></a
	>
{/snippet}

{#if keyLabel}{@render keyLabelSnippet()}{/if}{#if operator}{@render operatorSnippet()}{/if}{#if image || type}{@render imageSnippet()}{/if}{#if valueLabel}{@render valueLabelSnippet()}{/if}{#if valueLabel && removeLink}{@render removeLinkSnippet()}{/if}

<style lang="postcss">
	/** TODO: Add when resource links are available 
	@media (hover: none) {
		.lxl-qualifier.atomic > a {
			display: none;
		}

		.lxl-qualifier.atomic > span {
			display: inline;
		}
	}
		*/

	.icon-wrapper:empty {
		display: none;
	}
</style>
