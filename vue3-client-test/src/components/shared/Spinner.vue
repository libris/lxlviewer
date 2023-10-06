<script setup>
import { defineProps } from 'vue';

const props = defineProps({
	size: {
		type: String,
		default: null,
		required: false,
	},
});
</script>

<template>
	<div>
		<i
			class="fa fa-circle-o-notch fa-spin"
			:class="`fa-${props.size}`"
		/>
	</div>
</template>