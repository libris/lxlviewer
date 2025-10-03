<script lang="ts">
	import { page } from '$app/state';
	import type { DisplayMapping } from '$lib/types/search';
	import { getRelationSymbol } from '$lib/utils/getRelationSymbol';
	import BiXLg from '~icons/bi/x-lg';

	type Props = { subset: DisplayMapping[] };
	const { subset }: Props = $props();

	const removeLink = $derived.by(() => {
		const url = new URL(page.url);
		url.searchParams.delete('_r');
		return url.toString();
	});
</script>

{#each subset as s (s['@id'])}
	{@const fullLabel = `${s.label}${getRelationSymbol(s.operator)} ${s.displayStr}`}
	<div
		class="text-2xs bg-primary-200 flex h-8 items-center overflow-hidden rounded-sm lg:max-w-3xs"
	>
		<span class="truncate px-1.5" title={fullLabel}>
			{fullLabel}
		</span>
		<a
			href={removeLink}
			class="hover:bg-primary-300 text-subtle flex h-8 items-center justify-center px-1.5 text-xs"
			aria-label={page.data.t('search.removeFilter')}
		>
			<BiXLg />
		</a>
	</div>
{/each}
