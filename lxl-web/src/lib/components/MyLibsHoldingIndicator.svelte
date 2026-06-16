<script lang="ts">
	import { page } from '$app/state';
	import popover from '$lib/actions/popover';
	import type { LibOrg, LibraryId, LibraryWithLinks, OrgId } from '$lib/types/holdings';
	import { isLibraryOrg } from '$lib/utils/holdings';
	import BiHouseHeart from '~icons/bi/house-heart';

	type IndicatorProps = {
		libraries: string[];
		holdingLibraries?: Record<LibraryId, LibraryWithLinks | null>;
		refinedOrgs?: Record<OrgId, LibOrg>;
	};
	const { libraries, holdingLibraries, refinedOrgs }: IndicatorProps = $props();

	// libraries can be an array of labels or ids (libraries and orgs then needed for lookup)
	const indicatorText = $derived.by(() => {
		let availableAt = `${page.data.t('holdings.availableAt')}: `;
		let libNames = libraries.map((l) => {
			if (holdingLibraries && refinedOrgs) {
				if (isLibraryOrg(l)) {
					return refinedOrgs[l]?.name;
				} else {
					return holdingLibraries[l]?.name;
				}
			} else return l;
		});

		return availableAt + libNames.join(', ');
	});
</script>

<span
	aria-label={indicatorText}
	use:popover={{
		title: indicatorText
	}}
>
	<BiHouseHeart aria-hidden="true" class="libraries-indicator" />
</span>

<style>
	:global(.libraries-indicator) {
		color: var(--color-primary-700);
	}

	:global(.btn-cta .libraries-indicator) {
		color: var(--color-primary-50);
	}
</style>
