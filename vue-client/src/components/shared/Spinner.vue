<script setup>
const props = defineProps({
	size: {
		type: String,
		default: null,
		required: false,
	},
	message: {
		type: String,
		default: ''
	}
});

// TODO: Add message...
</script>

<template>
	<div class="spinner">
		<i
			class="fa fa-circle-o-notch fa-spin"
			:class="props.size ? `fa-${props.size}` : undefined"
		/>
		<span v-if="message" class="message">
			{{ message }}
		</span>
	</div>
</template>


<style scoped lang="less">
	.spinner {
		display: flex;
		flex-direction: column;
	}

	.message {
		margin-top: 0.5rem;
		color: @grey-darker;
	}
</style>