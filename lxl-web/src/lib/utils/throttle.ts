interface Callback {
	(e: PointerEvent): void;
}

export function throttle(callback: Callback, limit: number) {
	let lastCall = 0;
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let lastArg: PointerEvent;

	return function (e: PointerEvent) {
		const now = Date.now();

		if (now - lastCall >= limit) {
			lastCall = now;
			callback(e);
		} else {
			clearTimeout(timeout!);
			lastArg = e;
			timeout = setTimeout(
				() => {
					lastCall = Date.now();
					callback(lastArg);
				},
				limit - (now - lastCall)
			);
		}
	};
}

export function throttleRAF(callback: Callback) {
	let ticking = false;

	return function (arg: PointerEvent) {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(() => {
				callback(arg);
				ticking = false;
			});
		}
	};
}
