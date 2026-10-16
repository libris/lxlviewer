<script lang="ts">
	import { page } from '$app/state';
	import IconClose from '~icons/bi/x-lg';

	type Props = {
		ondismiss?: () => void;
	};

	let { ondismiss }: Props = $props();
	const dismissable = $derived(ondismiss);
</script>

<aside class={['app-banner bg-primary-200 flex w-full gap-2 p-2 text-sm font-medium']}>
	<div class="w-full">
		<p class="font-bold">{page.data.t('banner.message')}</p>
		<p>{page.data.t('banner.message2')}.</p>
	</div>
	{#if dismissable}
		<div>
			<button
				type="button"
				class="focus:*:bg-warning-800/25 hover:*:bg-warning-800/25 flex items-center justify-center"
				aria-label={page.data.t('banner.dismiss')}
				onclick={ondismiss}
			>
				<div
					class="bg-warning-800/10 text-body has-focus:bg-error flex size-6 items-center justify-center rounded-sm"
				>
					<IconClose class="size-4" onclick={ondismiss} />
				</div>
			</button>
		</div>
	{/if}
</aside>
