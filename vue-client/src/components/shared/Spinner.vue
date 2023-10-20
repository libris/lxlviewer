<script setup>
const props = defineProps({
	size: {
		type: String,
		default: null,
		required: false,
	},
});

// TODO: Add message...
</script>

<template>
	<div>
		<i
			class="fa fa-circle-o-notch fa-spin"
			:class="props.size ? `fa-${props.size}` : undefined"
		/>
	</div>
</template>
