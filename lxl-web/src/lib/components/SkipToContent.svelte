<script lang="ts">
	import { page } from '$app/state';
</script>

<a
	href="#content"
	class="text-link focs:top-0 fixed -top-full left-0 z-999 flex h-11 w-full items-center justify-center font-medium -outline-offset-2 focus:static lg:min-h-11"
>
	{page.data.t('header.skipToContent')}
</a>
