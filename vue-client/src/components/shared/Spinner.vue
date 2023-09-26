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
		<font-awesome-icon
			:icon="['fas', 'circle-notch']"
			:size="props.size"
			spin
		/>
	</div>
</template>