<div class="tablist flex" role="tablist" aria-label="Sample Tabs">
	<button role="tab" aria-selected="true" aria-controls="filters" id="tab-1" tabindex="0">
		Filter
	</button>
	<button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">
		Second Tab
	</button>
	<button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">
		Third Tab
	</button>
</div>

<style>
	.tablist {
		height: var(--toolbar-height);
	}

	[role='tab'] {
		border-bottom-width: calc(var(--spacing) * 1);
		border-bottom-style: solid;
		border-bottom-color: transparent;
	}

	[role='tab'][aria-selected='true'] {
		border-bottom-color: var(--color-accent);
	}
</style>
