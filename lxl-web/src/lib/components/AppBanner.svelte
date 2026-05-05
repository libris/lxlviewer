<script lang="ts">
	import { page } from '$app/state';
	import IconClose from '~icons/bi/x-lg';

	type Props = {
		ondismiss?: () => void;
	};

	let { ondismiss }: Props = $props();
	const dismissable = $derived(ondismiss);
</script>

<div
	class={[
		'app-banner bg-primary-200 fixed top-0 z-50 flex w-full items-baseline gap-2 px-3 text-sm font-medium md:pl-6',
		dismissable && 'pr-0'
	]}
>
	<p class="flex-1">
		<span>{page.data.t('banner.message')}</span>
		<a href="https://libris.kb.se/" class="link-subtle">{page.data.t('banner.old')}</a>
		<span>{page.data.t('banner.message2')}.</span>
	</p>
	{#if dismissable}
		<button
			type="button"
			class="focus:*:bg-warning-800/25 hover:*:bg-warning-800/25 flex h-9 w-11 items-center justify-center"
			aria-label={page.data.t('banner.dismiss')}
			onclick={ondismiss}
		>
			<div
				class="bg-warning-800/10 text-body has-focus:bg-error flex size-5 items-center justify-center rounded-sm"
			>
				<IconClose class="size-3" onclick={ondismiss} />
			</div>
		</button>
	{/if}
</div>

<style lang="postcss">
	.app-banner {
		height: var(--banner-height);
	}
</style>
