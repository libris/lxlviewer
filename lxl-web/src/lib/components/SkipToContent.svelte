<script lang="ts">
	import { page } from '$app/state';
</script>

<a
	href="#content"
	class="bg-primary-700 text-page fixed -top-full left-0 z-999 flex h-9 w-full items-center justify-center font-medium focus:top-0"
>
	{page.data.t('header.skipToContent')}
</a>
