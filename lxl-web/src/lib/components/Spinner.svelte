<span class="spinner"></span>

<style>
	.spinner {
		height: 100%;
		width: 100%;
		border: 1px solid #000;
		border-color: inherit;
		border-bottom-color: transparent;
		border-radius: 50%;
		display: inline-block;
		box-sizing: border-box;
		animation: rotation 0.7s linear infinite;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
