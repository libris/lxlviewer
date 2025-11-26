<script lang="ts">
	import { page } from '$app/state';
	import { type QualifierWidgetProps } from 'supersearch';
	import IconClose from '~icons/bi/x-lg';

	const { key, keyLabel, operator, value, valueLabel, removeLink }: QualifierWidgetProps = $props();

	/**
	 * TODO: Add resource links when API exposes the record ids/fnurgels in mappings
	 * const resourceLink = value?.match(/([a-z0-9]{15})#it"$/m)?.[1]; // only create links for fnurgels for now (lang:sv and similar should also be linkable in the future...)
	 */
</script>

{#if keyLabel}
	<span class="lxl-qualifier-key" data-qualifier-key={key}>
		{keyLabel}
	</span>
{/if}
{#if operator}
	<span class="lxl-qualifier-operator" data-qualifier-operator={operator}>
		{operator}
	</span>
{/if}
{#if valueLabel}
	<span
		class={keyLabel && operator ? 'lxl-qualifier-value' : 'lxl-qualifier-alias'}
		data-qualifier-value={value}
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
