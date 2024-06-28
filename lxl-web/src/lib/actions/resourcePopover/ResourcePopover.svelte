<script lang="ts">
	import type { ResourceData } from '$lib/types/resourceData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import Popover from '$lib/components/Popover.svelte';

	export let referenceElement: HTMLElement;
	export let data: ResourceData;
	export let onMouseOver: (event: MouseEvent) => void;
	export let onMouseLeave: (event: MouseEvent) => void;
	export let onFocus: (event: FocusEvent) => void;
	export let onBlur: (event: FocusEvent) => void;
</script>

<!-- 
  @component
	Renders a popover with decorated data.
	Note that `ResourcePopover.svelte` isn't intended to be used directly in page templates – use the `use:resourcePopover` action instead (see `$lib/actions/resourcePopover`).
-->
<Popover {referenceElement} {onMouseOver} {onMouseLeave} {onFocus} {onBlur}>
	<DecoratedData {data} block allowPopovers={false} />
</Popover>
