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
	id="app-banner"
	role="banner"
	class={[
		'bg-primary-200 z-50 flex hidden min-h-11 items-center justify-between gap-0 px-3 text-sm font-medium md:pl-6 2xl:text-base',
		dismissable && 'pr-0'
	]}
>
	<p class="my-2">
		<span>{page.data.t('banner.message')}</span>
		<a href="https://libris.kb.se/" class="link-subtle whitespace-nowrap"
			>{page.data.t('banner.old')}</a
		>
		<span>{page.data.t('banner.message2')}.</span>
	</p>
	{#if dismissable}
		<button
			type="button"
			class="focus:*:bg-primary-700/50 hover:*:bg-primary-700/50 2xl:min-w ml-auto flex h-11 min-w-14 items-center justify-center self-start -outline-offset-2 sm:self-center lg:min-w-11 2xl:min-h-12 lg:2xl:min-w-12"
			aria-label={page.data.t('banner.dismiss')}
			onclick={ondismiss}
		>
			<div
				class="bg-primary-700/25 text-body flex aspect-square size-6 items-center justify-center rounded-sm 2xl:size-6.5"
			>
				<IconClose class="size-3.5 2xl:size-4" onclick={ondismiss} />
			</div>
		</button>
	{/if}
</div>
