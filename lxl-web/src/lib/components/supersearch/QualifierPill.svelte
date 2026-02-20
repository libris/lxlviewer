<script lang="ts">
	import { page } from '$app/state';
	import type { QualifierRendererProps } from 'supersearch';
	import IconClose from '~icons/bi/x-lg';

	interface Props extends QualifierRendererProps {
		onclick?: () => void;
	}

	const { key, keyLabel, operator, value, valueLabel, removeLink, onclick }: Props = $props();

	/**
	 * TODO: Add resource links when API exposes the record ids/fnurgels in mappings
	 * const resourceLink = value?.match(/([a-z0-9]{15})#it"$/m)?.[1]; // only create links for fnurgels for now (lang:sv and similar should also be linkable in the future...)
	 */
</script>

{#if keyLabel}
	<span
		data-qualifier-key={key}
		class="lxl-qualifier-key cursor-text"
		role="button"
		tabindex="-1"
		{onclick}
		onkeypress={onclick}
	>
		{keyLabel}
	</span>
{/if}
{#if operator}
	<span
		class="lxl-qualifier-operator cursor-text"
		data-qualifier-operator={operator}
		role="button"
		tabindex="-1"
		{onclick}
		onkeypress={onclick}
	>
		{operator}
	</span>
{/if}
{#if valueLabel}
	<span
		class={[keyLabel && operator ? 'lxl-qualifier-value' : 'lxl-qualifier-alias', 'cursor-text']}
		data-qualifier-value={value}
		role="button"
		tabindex="-1"
		{onclick}
		onkeypress={onclick}
	>
		<!--
		{#if resourceLink}
			<span class="hidden">{valueLabel}</span><a href={page.data.localizeHref(`/${resourceLink}`)} class="link inline-block"
				>{valueLabel}</a
			>
		{:else}
			{valueLabel}
		{/if}
		-->
		{valueLabel}
	</span>
{/if}
{#if valueLabel && removeLink}
	<a
		href={page.data.localizeHref(removeLink)}
		class="lxl-qualifier-remove"
		aria-label={page.data.t('search.clearFilters')}
	>
		<IconClose />
	</a>
{/if}

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
</style>
