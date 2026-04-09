export function controlOrMetaKey(event: KeyboardEvent) {
	if (!event.ctrlKey && !event.metaKey) return false;
	const isMac = navigator.userAgent.includes('Mac OS X');
	if (isMac && event.metaKey) return true;
	if (!isMac && event.ctrlKey) return true;
	return false;
}

export default controlOrMetaKey;
