// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any
function debounce(callback: Function, wait: number | ((...args: any[]) => number | null) = 300) {
	let timeout: ReturnType<typeof setTimeout>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (...args: any[]) => {
		clearTimeout(timeout);
		const resolvedWait = typeof wait === 'function' ? wait(...args) : wait;
		if (resolvedWait !== null) {
			timeout = setTimeout(() => callback(...args), resolvedWait);
		}
	};
}

export default debounce;
