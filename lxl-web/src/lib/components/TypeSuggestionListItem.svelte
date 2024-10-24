<script lang="ts">
	import IconAdd from '~icons/mdi/plus';

	type TypeSuggestionListItem = {
		heading: string;
		hint: string;
		onclick?: (event: MouseEvent) => void;
	};

	let { heading, hint, onclick }: TypeSuggestionListItem = $props();
</script>

<li class="list-item">
	<button type="button" {onclick}>
		<span class="icon">
			<IconAdd />
		</span>
		<hgroup>
			<h3>{heading}</h3>
			<p class="hint">{hint}</p>
		</hgroup>
	</button>
</li>

<style>
	.list-item {
		display: flex;
		font-size: var(--font-size-sm);
	}

	button {
		display: flex;
		align-items: center;
		cursor: pointer;
		border: none;
		border: 1px solid var(--border-color);
		border-radius: 1000px;
		padding: 0 var(--padding-base) 0 var(--padding-xs);
		width: 100%;
		height: var(--height-input-base);
		overflow: hidden;
		text-align: left;

		&:hover,
		&:focus {
			background: rgba(14, 113, 128, 0.05);
		}
	}

	.icon {
		display: flex;
		margin-right: var(--padding-2xs);
		width: 24px;
		height: 24px;
		color: var(--color-super-subtle);
		font-size: 24px;
	}

	hgroup {
		overflow: hidden;
		color: var(--color-super-subtle);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	hgroup > * {
		display: inline;
		overflow: hidden;
	}

	h3,
	p {
		margin: 0;
		font-size: inherit;
	}

	h3 {
		color: var(--color-base);
		font-weight: 500;
	}

	.hint {
		font-style: italic;
		font-size: var(--font-size-xs);
	}
</style>
