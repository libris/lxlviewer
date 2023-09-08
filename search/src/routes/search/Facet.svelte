<script lang="ts">
	import IconClose from '~icons/mdi/close';

	export let label: string;
	export let deletable = false;
	export let link: string;
</script>

<span class="facet" class:deletable>
	{#if link}
		<a href={link} data-sveltekit-preload-data="tap">
			<div class="label">
				{label}
			</div>
			{#if deletable}
				<IconClose class="icon" />
			{/if}
		</a>
	{:else}
		<div class="label">{label}</div>
	{/if}
</span>

<style lang="scss">
	.facet {
		display: inline-flex;
		background: hsla(188, 95%, 25%, 0.125);
		border: 1px solid hsla(188, 95%, 25%, 1);
		border-radius: 44px;
		padding: 0.25rem 0.5rem;
		font-size: var(--font-size-smaller);
	}

	a {
		display: flex;
		align-items: center;
		flex: 1;
	}

	a:hover {
		text-decoration: none;
	}
	.label {
		display: inline-flex;
	}
	.label::first-letter {
		text-transform: uppercase;
	}

	:global(.icon) {
		margin-left: 0.25rem;
	}
</style>
