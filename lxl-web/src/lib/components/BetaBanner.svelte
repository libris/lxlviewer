<script lang="ts">
	import { page } from '$app/state';
	import IconFeedback from '~icons/bi/chat-dots';
	import IconGoto from '~icons/bi/chevron-right';
	import IconClose from '~icons/bi/x-lg';

	let dismissed = $state(false);

	function handleDismiss() {
		dismissed = true;
	}
</script>

{#if !dismissed}
	<div
		class="beta-banner bg-warning-300 flex min-h-9 place-content-between items-stretch gap-1.5 px-3 pr-0 font-medium"
	>
		<span class="flex flex-1 items-center gap-1.5">
			<span class="text-3xs flex h-5 items-center rounded-sm bg-black px-1 text-white uppercase"
				>Beta</span
			>
			<span class="text-xs/3">
				<span class="lg:hidden">
					{page.data.t('banner.messageMobile')}
				</span>
				<span class="hidden lg:inline">
					{page.data.t('banner.messageDesktop')}
				</span>
			</span>
		</span>
		<span class="flex gap-1.5 text-xs whitespace-nowrap md:gap-3">
			<a href={page.data.localizeHref?.('/about')} class="link-subtle hidden items-center md:flex">
				<IconFeedback class="mr-1 size-3" />
				{page.data.t('banner.feedback')}
			</a>
			<a href="https://libris.kb.se" class="link-subtle hidden items-center md:flex">
				<IconGoto class="mr-0.75 size-3" />
				{page.data.t('banner.old')}
			</a>
		</span>
		<button
			type="button"
			class="focus:[&>*]:bg-warning-800/25 hover:[&>*]:bg-warning-800/25 flex h-9 w-11 items-center justify-center"
			aria-label={page.data.t('banner.dismiss')}
			onclick={handleDismiss}
		>
			<div
				class="bg-warning-800/10 text-body has-focus:bg-error flex size-5 items-center justify-center rounded-sm"
			>
				<IconClose class="size-3" />
			</div>
		</button>
	</div>
{/if}
